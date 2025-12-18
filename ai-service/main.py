from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from PIL import Image
import numpy as np
import io
import uvicorn
import os
import json

# MOCK MODE: Handle missing heavy libraries
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
except ImportError:
    print("⚠️ TensorFlow not found. Running in MOCK mode.")
    tf = None
    load_model = None

try:
    import easyocr
except ImportError:
    print("⚠️ EasyOCR not found. Running in MOCK mode.")
    easyocr = None

# --- MODEL VE AYARLAR ---
MODEL_PATH = "kalorilens_model.h5"
LABELS_PATH = "labels.json"
ai_models = {}

def load_labels():
    """Etiket listesini json dosyasından okur."""
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, "r") as f:
            return json.load(f)
    return []

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n AI Modelleri Yükleniyor...")
    
    # TensorFlow Model Yükleme
    if load_model is not None:
        try:
            # DÜZELTME: Model yolunu direkt buraya yazdık
            if os.path.exists("kalorilens_model.h5"):
                ai_models["food_model"] = load_model("kalorilens_model.h5")
                print("✅ Food Model (KaloriLens AI) yüklendi!")
            else:
                print("⚠️ Uyarı: 'kalorilens_model.h5' bulunamadı. /predict endpoint'i çalışmayabilir (Mock Mode).")
                ai_models["food_model"] = None
        except Exception as e:
            print(f"❌ Model Yükleme Hatası: {e}")
            ai_models["food_model"] = None
    else:
        print("ℹ️ TensorFlow yüklü değil. Mock modunda çalışılıyor.")
        ai_models["food_model"] = None

    # EasyOCR Yükleme
    if easyocr is not None:
        print("✅ EasyOCR yüklendi.")
        ai_models["ocr_reader"] = easyocr.Reader(['tr', 'en'], gpu=False)
    else:
        print("ℹ️ EasyOCR yüklü değil.")
        ai_models["ocr_reader"] = None # Ensure it's explicitly None if not loaded

    print("Modeller Hazır!")
    yield
    
    print("Modeller temizlendi.")
    ai_models.clear()

# --- FURKAN İÇİN EKLENEN AÇIKLAMA (DESCRIPTION) ---
description_text = """
KaloriLens AI Servisi, yemek fotoğraflarını analiz ederek kalori tahmini yapar.
Bu API şu özellikleri içerir:
* **Yemek Tanıma:** TensorFlow/MobileNetV2 tabanlı görüntü işleme.
* **Metin Okuma (OCR):** Ürün paketlerindeki yazıları okumak için EasyOCR (Opsiyonel).
"""
# --------------------------------------------------

# Description parametresini buraya ekledik
app = FastAPI(
    title="KaloriLens AI Service",
    description=description_text,
    lifespan=lifespan
)

def prepare_image(image: Image.Image):
    """Resmi modelin anlayacağı formata (224x224, normalize) çevirir."""
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    # 1. Boyutlandır (MobileNetV2 224x224 ister)
    image = image.resize((224, 224))
    
    # 2. Diziye çevir ve Normalize et (0-1 arasına sıkıştır)
    img_array = np.array(image) / 255.0
    
    # 3. Boyut ekle (Batch dimension) -> (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

@app.get("/")
def home():
    return {"status": "active", "message": "KaloriLens AI Servisi Çalışıyor 🚀 (TensorFlow + EasyOCR)"}

@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Lütfen bir resim dosyası yükleyin.")
    
    model = ai_models.get("food_model")
    if model is None:
         # Mock Response for testing without model
         print("⚠️ Model bulunamadı, Mock cevap dönülüyor.")
         return {
            "label": "kuru_fasulye", 
            "score": 0.99,
            "nutrition": {
                "calories": 0,
                "protein": 0,
                "fat": 0,
                "carbs": 0
            }
        }

    try:
        # Dosyayı Oku
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        
        # MobileNetV2 Preprocessing (prepare_image kullanımı korundu)
        img_array = prepare_image(image)

        # Tahmin Yap
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions)
        score = float(np.max(predictions))
        
        # JSON dosyasını oku ve etiketi bul
        labels = load_labels()
        if labels and len(labels) > predicted_class_idx:
            label = labels[predicted_class_idx]
        else:
            label = f"Bilinmeyen ({predicted_class_idx})"

        return {
            "label": label,
            "score": round(score, 2),
            "nutrition": {
                "calories": 0,
                "protein": 0,
                "fat": 0,
                "carbs": 0
            }
        }

    except Exception as e:
        print(f"Hata detayı: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)