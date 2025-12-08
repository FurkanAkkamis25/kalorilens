from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch
import easyocr
import io
import uvicorn

# --- 1. MODEL CACHE (HIZLANDIRMA) ---
# Modelleri global değişkenlerde tutacağız, böylece her istekte tekrar yüklenmeyecek.
ai_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n AI Modelleri Yükleniyor... (Bu işlem ilk seferde biraz sürebilir)")
    
    # A. Yemek Modelini Yükle (ViT)
    ai_models["processor"] = ViTImageProcessor.from_pretrained("nateraw/food")
    ai_models["food_model"] = ViTForImageClassification.from_pretrained("nateraw/food")
    print(" Yemek Modeli Hazır!")

    # B. OCR Modelini Yükle (EasyOCR)
    # Türkçe ve İngilizce dillerini desteklesin
    ai_models["ocr_reader"] = easyocr.Reader(['tr', 'en'], gpu=False)
    print(" OCR (Yazı Okuma) Modeli Hazır!")
    
    print(" Sunucu Başlatıldı! İstek bekleniyor...\n")
    yield
    # Kapanırken yapılacak temizlikler (gerekirse)
    ai_models.clear()

# --- 2. FASTAPI UYGULAMASI ---
app = FastAPI(title="KaloriLens AI Service", lifespan=lifespan)

@app.get("/")
def home():
    return {"status": "active", "message": "KaloriLens AI Servisi Çalışıyor 🚀"}

@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    """
    Yemek fotoğrafı alır, ne olduğunu ve güven oranını döner.
    """
    # Dosya kontrolü
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Lütfen bir resim dosyası yükleyin.")

    try:
        # Resmi oku ve işle
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")

        # Cache'den modelleri al
        processor = ai_models["processor"]
        model = ai_models["food_model"]

        # Tahmin yap
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Sonucu hazırla
        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        label = model.config.id2label[predicted_class_idx]
        confidence = float(torch.softmax(logits, dim=1)[0][predicted_class_idx])

        # JSON Cevabı (Furkan'ın istediği format)
        return {
            "food_name": label,
            "confidence": round(confidence, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ocr")
async def read_nutrition_label(file: UploadFile = File(...)):
    """
    Ürün etiketi fotoğrafı alır, üzerindeki yazıları okur.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Lütfen bir resim dosyası yükleyin.")
    
    try:
        content = await file.read()
        
        # EasyOCR modelini al
        reader = ai_models["ocr_reader"]
        
        # Yazıları oku (detail=0 sadece metin listesini verir)
        result = reader.readtext(content, detail=0)
        
        return {
            "extracted_text": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Tarık'ın istediği port: 5000
    uvicorn.run(app, host="0.0.0.0", port=8000)