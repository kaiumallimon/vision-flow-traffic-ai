import os
import shutil
import time
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ultralytics import YOLO

# Absolute imports from your backend folder
from backend.database import engine, Base, SessionLocal, DetectionHistory, User
from backend.ai_advisor import get_contextual_advice
from backend.model_logic import generate_gradcam

app = FastAPI()

# Enable CORS for React communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup folders for image storage
UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static_uploads", StaticFiles(directory=UPLOAD_DIR), name="static_uploads")

# Ensure tables are ready in test.db
Base.metadata.create_all(bind=engine)

# Load YOLO Model
# We use 'cpu' to avoid the CUDA/GPU error you received
model = YOLO("yolo11n_openvino_model/", task="detect")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AUTHENTICATION MODELS ---
class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# --- AUTHENTICATION ENDPOINTS ---
@app.post("/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        return {"error": "Email already exists"}
    
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password=user_data.password
    )
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email, User.password == user_data.password).first()
    if not user:
        return {"error": "Invalid credentials"}
    return {
        "message": "Login successful", 
        "user": {"first_name": user.first_name, "email": user.email}
    }

# --- AI ANALYSIS ENDPOINT ---
@app.post("/analyze")
async def analyze_image(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    ts = int(time.time())
    input_filename = f"input_{ts}.jpg"
    heatmap_filename = f"heatmap_{ts}.jpg"
    file_path = os.path.join(UPLOAD_DIR, input_filename)
    heatmap_path = os.path.join(UPLOAD_DIR, heatmap_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # STRICKLY USE CPU TO FIX YOUR ERROR
        # We pass device='cpu' explicitly
        results = model.predict(source=file_path, device='cpu', conf=0.25)
        
        if len(results[0].boxes) > 0:
            class_id = int(results[0].boxes.cls[0])
            label = results[0].names[class_id]
        else:
            class_id = None
            label = "Nothing detected"

        # Generate XAI Heatmap
        generate_gradcam(model, file_path, class_id=class_id, save_path=heatmap_path)
        
        # Get LLM Advice (Make sure you updated your key in ai_advisor.py!)
        advice = get_contextual_advice(label)

        # Save record to database
        new_record = DetectionHistory(object_name=label, advice=advice, image_path=file_path)
        db.add(new_record)
        db.commit()

        base_url = str(request.base_url).rstrip('/')
        return {
            "detected": label,
            "advice": advice,
            "heatmap_url": f"{base_url}/static_uploads/{heatmap_filename}",
            "original_url": f"{base_url}/static_uploads/{input_filename}"
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        # Return a clearer error message to the frontend
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    return db.query(DetectionHistory).order_by(DetectionHistory.id.desc()).all()