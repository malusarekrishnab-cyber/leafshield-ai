from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import os
import traceback

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

# Print all classes the model actually knows — check this against your training classes
print("MODEL CLASSES:", model.names)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Lowered temporarily for debugging. Raise back to 60 once you confirm real confidence values.
CONFIDENCE_THRESHOLD = 30

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
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        results = model.predict(
            source=file_path,
            imgsz=224,
            verbose=False
        )

        probs = results[0].probs

        if probs is None:
            # This means the model is NOT a classification model
            # (e.g. it's a detect/segment model instead of classify)
            print("ERROR: model.predict() returned no classification probs. "
                  "Check that best.pt is a YOLO CLASSIFICATION model.")
            return {
                "plant": "Unknown",
                "disease": "Model Error",
                "confidence": 0,
                "healthy": False,
                "severity": "unknown",
                "symptoms": "Model did not return classification results.",
                "treatment": "Check backend logs — model type mismatch.",
                "prevention": "N/A"
            }

        class_id = probs.top1
        confidence = float(probs.top1conf) * 100
        disease_raw = results[0].names[class_id]

        # THIS IS THE KEY DEBUG LINE — check your terminal after each upload
        print(f"DEBUG -> Predicted: {disease_raw}, Confidence: {confidence:.2f}%")

        # Confidence threshold
        if confidence < CONFIDENCE_THRESHOLD:
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

    except Exception as e:
        # This makes sure that if something crashes, you SEE the real error
        # instead of the frontend just silently falling back to "Unknown"
        print("PREDICT ERROR:", str(e))
        traceback.print_exc()
        return {
            "plant": "Unknown",
            "disease": "Server Error",
            "confidence": 0,
            "healthy": False,
            "severity": "unknown",
            "symptoms": f"Backend error: {str(e)}",
            "treatment": "Check backend terminal logs for full traceback.",
            "prevention": "N/A"
        }