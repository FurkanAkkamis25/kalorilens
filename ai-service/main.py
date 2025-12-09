from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch
import easyocr
import io
import uvicorn

# --- 1. MODEL CACHE (HIZLANDIRMA) ---
ai_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n AI Modelleri Yükleniyor...")
    ai_models["processor"] = ViTImageProcessor.from_pretrained("nateraw/food")
    ai_models["food_model"] = ViTForImageClassification.from_pretrained("nateraw/food")
    ai_models["ocr_reader"] = easyocr.Reader(['tr', 'en'], gpu=False)
    print(" Modeller Hazır!")
    yield
    ai_models.clear()

app = FastAPI(title="KaloriLens AI Service", lifespan=lifespan)

@app.get("/")
def home():
    return {"status": "active", "message": "KaloriLens AI Servisi Çalışıyor 🚀"}

@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Lütfen bir resim dosyası yükleyin.")

    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")

        # Tahmin Yap
        processor = ai_models["processor"]
        model = ai_models["food_model"]
        inputs = processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        label = model.config.id2label[predicted_class_idx]
        score = float(torch.softmax(logits, dim=1)[0][predicted_class_idx])

        # --- DÜZELTME: Emin'in Veritabanı Formatı ---
        # Tarık'ın uygulaması çökmesin diye nutrition bilgisini şimdilik boş/temsili dönüyoruz.
        # İleride burayı gerçek veritabanından çekeceğiz.
        return {
            "label": label,      # food_name yerine label
            "score": round(score, 2), # confidence yerine score
            "nutrition": {       # Yeni eklenen alan
                "calories": 0,   # Veritabanı bağlanana kadar 0
                "protein": 0,
                "fat": 0,
                "carbs": 0
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ocr")
async def read_nutrition_label(file: UploadFile = File(...)):
    try:
        content = await file.read()
        reader = ai_models["ocr_reader"]
        result = reader.readtext(content, detail=0)
        return {"extracted_text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)