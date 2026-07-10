from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os

app = FastAPI(title="LeafShield AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model only once
model = YOLO("model/best.pt")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Disease Information
DISEASE_INFO = {
    "Late blight": {
        "severity": "high",
        "symptoms": "Dark brown or black spots spread quickly on leaves.",
        "treatment": "Apply recommended fungicide immediately and remove infected leaves.",
        "prevention": "Avoid overwatering and improve air circulation."
    },
    "Early blight": {
        "severity": "medium",
        "symptoms": "Brown circular spots with concentric rings.",
        "treatment": "Use fungicide and remove infected leaves.",
        "prevention": "Rotate crops and avoid wet foliage."
    },
    "healthy": {
        "severity": "low",
        "symptoms": "No disease detected.",
        "treatment": "No treatment required.",
        "prevention": "Continue proper watering and fertilization."
    }
}


@app.get("/")
def home():
    return {
        "message": "LeafShield AI Backend Running 🚀"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    results = model.predict(
    source=file_path,
    imgsz=224,
    verbose=False
)

    probs = results[0].probs

    class_id = probs.top1

    confidence = float(probs.top1conf) * 100

    disease_raw = results[0].names[class_id]

    # Confidence threshold
    if confidence < 60:
        return {
            "plant": "Unknown",
            "disease": "Unknown Plant",
            "confidence": round(confidence, 2),
            "healthy": False,
            "severity": "unknown",
            "symptoms": "Plant could not be identified.",
            "treatment": "Upload a clearer image.",
            "prevention": "Use a clear close-up photo of one leaf."
        }

    # Split plant & disease
    if "___" in disease_raw:
        plant, disease = disease_raw.split("___")
    else:
        plant = "Unknown"
        disease = disease_raw

    disease = disease.replace("_", " ")

    healthy = "healthy" in disease.lower()

    if healthy:
        info = DISEASE_INFO["healthy"]
    else:
        info = DISEASE_INFO.get(
            disease,
            {
                "severity": "medium",
                "symptoms": "Disease detected by AI model.",
                "treatment": "Consult an agriculture expert.",
                "prevention": "Maintain proper plant hygiene."
            }
        )

    return {
        "plant": plant,
        "disease": disease,
        "confidence": round(confidence, 2),
        "healthy": healthy,
        "severity": info["severity"],
        "symptoms": info["symptoms"],
        "treatment": info["treatment"],
        "prevention": info["prevention"]
    }