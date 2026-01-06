import os
import shutil
import time
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from email_validator import validate_email, EmailNotValidError # New Import
from ultralytics import YOLO

# Project imports
from backend.database import engine, Base, SessionLocal, DetectionHistory, User
from backend.ai_advisor import get_contextual_advice
from backend.model_logic import generate_gradcam

# --- DATABASE INITIALIZATION ---
Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Folder setup for images
UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static_uploads", StaticFiles(directory=UPLOAD_DIR), name="static_uploads")

# Load AI Model
model = YOLO("yolo11n_openvino_model/", task="detect")

# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- DATA MODELS ---
class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class SocialAuth(BaseModel):
    email: str
    first_name: str
    last_name: str
    google_id: str

# --- AUTHENTICATION ROUTES ---

@app.post("/register")
async def register(data: UserCreate, db: Session = Depends(get_db)):
    # 1. VALIDATE IF EMAIL IS REAL (Domain Check)
    try:
        # deliverability=True checks if the domain actually exists on the internet
        email_info = validate_email(data.email, check_deliverability=True)
        valid_email = email_info.normalized
    except EmailNotValidError as e:
        # This stops fake emails like 'test@asdf123.com'
        raise HTTPException(status_code=400, detail=f"Invalid or fake email: {str(e)}")

    # 2. CHECK IF ALREADY EXISTS
    existing_user = db.query(User).filter(User.email == valid_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=valid_email,
        password=data.password
    )
    db.add(new_user)
    db.commit()
    return {"message": "Success"}

@app.post("/login")
async def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.password == data.password).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user": {"email": user.email, "first_name": user.first_name}}

@app.post("/auth/google")
async def google_auth(data: SocialAuth, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        user = User(
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            google_id=data.google_id,
            password="GOOGLE_SOCIAL_USER" 
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.google_id:
            user.google_id = data.google_id
            db.commit()
    return {"message": "Login successful", "user": {"email": user.email, "first_name": user.first_name}}

# --- AI ANALYSIS ROUTE ---

@app.post("/analyze")
async def analyze_image(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    ts = int(time.time())
    file_path = os.path.join(UPLOAD_DIR, f"input_{ts}.jpg")
    heatmap_path = os.path.join(UPLOAD_DIR, f"heatmap_{ts}.jpg")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        results = model.predict(source=file_path, device='cpu', conf=0.25)
        label = results[0].names[int(results[0].boxes.cls[0])] if results[0].boxes else "Nothing detected"
        class_id = int(results[0].boxes.cls[0]) if results[0].boxes else None
        
        generate_gradcam(model, file_path, class_id=class_id, save_path=heatmap_path)
        advice = get_contextual_advice(label)

        db.add(DetectionHistory(object_name=label, advice=advice, image_path=file_path))
        db.commit()

        base_url = str(request.base_url).rstrip('/')
        return {
            "detected": label,
            "advice": advice,
            "heatmap_url": f"{base_url}/static_uploads/heatmap_{ts}.jpg",
            "original_url": f"{base_url}/static_uploads/input_{ts}.jpg"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    return db.query(DetectionHistory).order_by(DetectionHistory.id.desc()).all()

# --- SERVE FRONTEND ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_dist = os.path.join(BASE_DIR, "frontend", "dist")
if os.path.exists(os.path.join(frontend_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

@app.get("/{catchall:path}")
async def serve_react(catchall: str):
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Frontend build not found. Run 'npm run build'"}