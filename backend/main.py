import os
import shutil
import time
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from ultralytics import YOLO

# Custom imports - ensure these files exist in your backend folder
from .database import engine, Base, SessionLocal, DetectionHistory
from .ai_advisor import get_contextual_advice
from .model_logic import generate_gradcam

app = FastAPI()

# 1. Enable CORS so React can talk to Python from any device
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Setup Upload Directory
UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 3. STATIC MOUNT: Serves the 'uploads' folder so the browser can see images
app.mount("/static_uploads", StaticFiles(directory=UPLOAD_DIR), name="static_uploads")

Base.metadata.create_all(bind=engine)

# Load YOLO Model (OpenVINO for Intel GPU performance)
model = YOLO("yolo11n_openvino_model/", task="detect")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
        # 1. AI Detection
        results = model.predict(source=file_path, device='intel:gpu', conf=0.25)
        
        if len(results[0].boxes) > 0:
            class_id = int(results[0].boxes.cls[0])
            label = results[0].names[class_id]
        else:
            class_id = None
            label = "Nothing detected"

        # 2. XAI Heatmap Generation
        generate_gradcam(model, file_path, class_id=class_id, save_path=heatmap_path)

        # 3. Get Gemini Advice
        advice = get_contextual_advice(label)

        # 4. Save to History
        new_record = DetectionHistory(object_name=label, advice=advice, image_path=file_path)
        db.add(new_record)
        db.commit()
        db.refresh(new_record)

        # Generate dynamic URL based on the current request (works for ngrok)
        base_url = str(request.base_url).rstrip('/')
        
        return {
            "detected": label,
            "advice": advice,
            "heatmap_url": f"{base_url}/static_uploads/{heatmap_filename}",
            "original_url": f"{base_url}/static_uploads/{input_filename}"
        }
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- CORRECTED HISTORY ENDPOINT ---
@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    """
    Returns all previous detections from the database.
    """
    try:
        history = db.query(DetectionHistory).order_by(DetectionHistory.id.desc()).all()
        return history
    except Exception as e:
        print(f"History Error: {e}")
        raise HTTPException(status_code=500, detail="Database retrieval failed")