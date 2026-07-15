from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import numpy as np
import shutil
import os
import traceback


def looks_like_plant(image_path, min_green_ratio=0.12):
    """
    Quick heuristic gate BEFORE running the YOLO model.
    The classification model was trained only on 38 known plant/disease
    classes and has no 'not_a_plant' class — so it will always confidently
    pick one of those 38, even for a face or a random object.
    This checks whether a meaningful portion of the image is green
    (typical of leaves/plants). It is NOT perfect — a green shirt or
    green wall can still pass — but it blocks the most obvious
    non-plant photos (faces, rooms, etc.) before wasting a model call.
    """
    try:
        img = Image.open(image_path).convert("RGB").resize((128, 128))
        arr = np.array(img).astype(int)
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        # "green-ish" pixel: green channel clearly dominant over red and blue
        green_mask = (g > r + 10) & (g > b + 10)
        green_ratio = green_mask.sum() / (arr.shape[0] * arr.shape[1])
        return green_ratio >= min_green_ratio, round(green_ratio * 100, 2)
    except Exception as e:
        print("GREEN CHECK ERROR:", str(e))
        # If the check itself fails, don't block the request — let the model try.
        return True, 0.0

app = FastAPI(title="LeafShield AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://leafshield-ai.vercel.app",
    ],
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

# NOTE: Raised from 65 to 85. This does NOT fully solve non-plant images
# (a face, a car, etc.) being misclassified — the model was never trained
# with a "not_a_plant" class, so it will always pick its closest match
# among the 38 known classes, sometimes with high confidence.
# The permanent fix is retraining with a "not_a_plant" / background class.
CONFIDENCE_THRESHOLD = 85

# Disease Information - covers all 38 classes the model was trained on
DISEASE_INFO = {
    "Apple scab": {
        "severity": "medium",
        "symptoms": "Olive-green to brown velvety spots on leaves and fruit; leaves may curl and drop early.",
        "treatment": "Apply fungicide (captan or myclobutanil) at bud break and repeat every 7-10 days during wet weather.",
        "prevention": "Rake and destroy fallen leaves in autumn; choose scab-resistant apple varieties; prune for good air circulation."
    },
    "Black rot": {
        "severity": "high",
        "symptoms": "Purple spots on leaves that enlarge into brown rings; fruit shows sunken black rotted areas.",
        "treatment": "Remove and destroy infected fruit and cankers; apply fungicide starting at bloom time.",
        "prevention": "Prune out dead wood and mummified fruit; ensure good airflow; avoid overhead irrigation."
    },
    "Cedar apple rust": {
        "severity": "medium",
        "symptoms": "Bright orange-yellow spots on upper leaf surface, small black dots appear in the center of spots.",
        "treatment": "Apply fungicide from pink bud stage through several weeks after petal fall.",
        "prevention": "Remove nearby Eastern red cedar trees if possible; plant rust-resistant apple varieties."
    },
    "Cercospora leaf spot Gray leaf spot": {
        "severity": "medium",
        "symptoms": "Small rectangular gray-to-brown lesions on leaves that run parallel to leaf veins.",
        "treatment": "Apply foliar fungicide when lesions first appear, especially in humid conditions.",
        "prevention": "Rotate crops with non-host plants; use resistant hybrids; manage crop residue."
    },
    "Common rust": {
        "severity": "medium",
        "symptoms": "Small, reddish-brown, oval to elongated pustules scattered on both leaf surfaces.",
        "treatment": "Apply fungicide if rust appears early and weather stays humid; usually not needed late season.",
        "prevention": "Plant resistant hybrids; avoid excessive nitrogen fertilization; monitor fields regularly."
    },
    "Northern Leaf Blight": {
        "severity": "high",
        "symptoms": "Long, cigar-shaped gray-green to tan lesions on leaves, often starting on lower leaves.",
        "treatment": "Apply fungicide at first sign of disease, particularly in susceptible hybrids.",
        "prevention": "Rotate crops, till under crop residue, and plant resistant hybrids."
    },
    "Bacterial spot": {
        "severity": "high",
        "symptoms": "Small, dark, water-soaked spots on leaves and fruit that may have a yellow halo.",
        "treatment": "Apply copper-based bactericide; remove severely infected plants to limit spread.",
        "prevention": "Use disease-free seeds/transplants; avoid overhead watering; rotate crops."
    },
    "Early blight": {
        "severity": "medium",
        "symptoms": "Brown circular spots with concentric rings, often forming a target-like pattern on lower leaves first.",
        "treatment": "Apply fungicide (chlorothalonil or copper) and remove infected leaves promptly.",
        "prevention": "Rotate crops every 2-3 years; avoid wetting foliage; stake plants for airflow."
    },
    "Late blight": {
        "severity": "high",
        "symptoms": "Dark, water-soaked, rapidly spreading brown-black lesions on leaves and stems, often with white fungal growth underneath in humid weather.",
        "treatment": "Apply fungicide immediately at first sign and remove infected plants; act fast since it spreads quickly.",
        "prevention": "Avoid overhead watering, improve air circulation, and plant certified disease-free seed potatoes/transplants."
    },
    "Haunglongbing (Citrus greening)": {
        "severity": "high",
        "symptoms": "Blotchy yellow mottling on leaves (asymmetric across the midrib), stunted growth, and misshapen bitter fruit.",
        "treatment": "No cure exists; remove and destroy infected trees to prevent spread to healthy ones.",
        "prevention": "Control Asian citrus psyllid insects (the disease vector) and plant certified disease-free nursery stock."
    },
    "Leaf blight (Isariopsis Leaf Spot)": {
        "severity": "medium",
        "symptoms": "Angular brown-red spots on leaves, sometimes with a yellow halo, leading to premature leaf drop.",
        "treatment": "Apply fungicide during wet periods and remove heavily infected leaves.",
        "prevention": "Improve canopy air circulation through pruning; avoid overhead irrigation."
    },
    "Esca (Black Measles)": {
        "severity": "high",
        "symptoms": "Tiger-stripe pattern of yellow/red streaks between leaf veins; berries may show dark spots.",
        "treatment": "No effective cure; prune out and destroy infected wood during dry weather.",
        "prevention": "Avoid pruning wounds during wet weather; protect pruning cuts; maintain vine vigor."
    },
    "Powdery mildew": {
        "severity": "medium",
        "symptoms": "White to gray powdery fungal growth coating leaves, stems, and sometimes fruit.",
        "treatment": "Apply sulfur-based or potassium bicarbonate fungicide at first sign of white patches.",
        "prevention": "Improve air circulation through pruning/spacing; avoid excess nitrogen; choose resistant varieties."
    },
    "Leaf Mold": {
        "severity": "medium",
        "symptoms": "Pale yellow spots on upper leaf surface with olive-green to grayish-purple mold on the underside.",
        "treatment": "Apply fungicide and improve ventilation; remove and destroy infected leaves.",
        "prevention": "Reduce humidity in greenhouses/tunnels; avoid overhead watering; space plants for airflow."
    },
    "Septoria leaf spot": {
        "severity": "medium",
        "symptoms": "Small circular spots with dark borders and gray/tan centers, often with tiny black specks (fungal fruiting bodies) inside.",
        "treatment": "Apply fungicide (chlorothalonil or copper-based) and remove lower infected leaves.",
        "prevention": "Mulch around base of plants, avoid overhead watering, and rotate crops yearly."
    },
    "Spider mites Two-spotted spider mite": {
        "severity": "medium",
        "symptoms": "Fine yellow stippling/speckling on leaves, fine webbing on undersides in heavy infestations.",
        "treatment": "Apply miticide or insecticidal soap; spray undersides of leaves thoroughly.",
        "prevention": "Keep plants well-watered (mites thrive in dry conditions); introduce natural predators like ladybugs."
    },
    "Target Spot": {
        "severity": "medium",
        "symptoms": "Brown lesions with concentric rings resembling a target, starting on older leaves.",
        "treatment": "Apply fungicide at first appearance and remove severely affected leaves.",
        "prevention": "Rotate crops, avoid leaf wetness, and stake/prune for airflow."
    },
    "Tomato Yellow Leaf Curl Virus": {
        "severity": "high",
        "symptoms": "Upward curling and yellowing of leaves, stunted plant growth, and reduced fruit yield.",
        "treatment": "No cure; remove and destroy infected plants immediately to reduce whitefly transmission.",
        "prevention": "Control whitefly populations (the virus vector) and use resistant tomato varieties."
    },
    "Tomato mosaic virus": {
        "severity": "high",
        "symptoms": "Mottled light and dark green mosaic pattern on leaves, leaf curling, and stunted growth.",
        "treatment": "No cure; remove and destroy infected plants; disinfect tools between plants.",
        "prevention": "Wash hands and tools before handling plants; use certified virus-free seed; avoid tobacco use near plants."
    },
    "Leaf scorch": {
        "severity": "medium",
        "symptoms": "Reddish-purple to brown discoloration along leaf edges and between veins, leaves appear scorched.",
        "treatment": "Remove severely affected leaves and apply fungicide during the growing season.",
        "prevention": "Ensure adequate watering during dry spells; avoid overhead irrigation; renovate beds regularly."
    },
    "healthy": {
        "severity": "low",
        "symptoms": "No disease detected. Leaf color and structure appear normal.",
        "treatment": "No treatment required.",
        "prevention": "Continue proper watering, fertilization, and regular monitoring for early signs of disease."
    },
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

        is_plant, green_pct = looks_like_plant(file_path)
        print(f"DEBUG -> Green pixel ratio: {green_pct}%")

        if not is_plant:
            return {
                "plant": "Unknown",
                "disease": "Not a Plant Image",
                "confidence": 0,
                "healthy": False,
                "severity": "unknown",
                "symptoms": "This image does not appear to contain a plant leaf.",
                "treatment": "Please upload a clear photo of a plant leaf.",
                "prevention": "Take a close-up photo of a single leaf in good lighting."
            }

        results = model.predict(
            source=file_path,
            imgsz=224,
            verbose=False
        )

        probs = results[0].probs

        if probs is None:
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

        print(f"DEBUG -> Predicted: {disease_raw}, Confidence: {confidence:.2f}%")

        # Confidence threshold
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "plant": "Unknown",
                "disease": "Unknown Plant",
                "confidence": round(confidence, 2),
                "healthy": False,
                "severity": "unknown",
                "symptoms": "Plant could not be identified with enough confidence.",
                "treatment": "Upload a clearer image.",
                "prevention": "Use a clear close-up photo of a single leaf in good lighting."
            }

        # Split plant & disease
        if "___" in disease_raw:
            plant, disease = disease_raw.split("___")
        else:
            plant = "Unknown"
            disease = disease_raw

        disease = disease.replace("_", " ").strip()

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