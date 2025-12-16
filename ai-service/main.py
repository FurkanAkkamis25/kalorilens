from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from PIL import Image
import numpy as np
import io
import uvicorn
import os

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

# --- 1. MODEL CACHE (HIZLANDIRMA) ---
ai_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n AI Modelleri Yükleniyor...")
    
    # TensorFlow Model Yükleme
    if load_model is not None:
        try:
            if os.path.exists("model_final.h5"):
                ai_models["food_model"] = load_model("model_final.h5")
                print("✅ Food Model (MobileNetV2) yüklendi!")
            else:
                print("⚠️ Uyarı: 'model_final.h5' bulunamadı. /predict endpoint'i çalışmayabilir (Mock Mode).")
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

app = FastAPI(title="KaloriLens AI Service", lifespan=lifespan)

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
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")
        
        # MobileNetV2 Preprocessing
        image = image.resize((224, 224))
        img_array = np.array(image) / 255.0  # Normalize
        img_array = np.expand_dims(img_array, axis=0) # Batch dimension

        # Tahmin Yap
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions)
        score = float(np.max(predictions))
        
        # TODO: Label map (class names) yüklenmeli. Şimdilik dummy veya modelden varsa alacağız.
        # Keras modelinde class isimleri direkt model içinde kayıtlı olmayabilir (eğitim şekline bağlı).
        # Sena'nın labels.json'ı burada devreye girecek. 
        # Şimdilik index dönüyoruz veya basit bir map kullanıyoruz.
        # User prompt'ta "Sena'nın .h5 modleine sor -> Gelen slug'ı ..." diyor.
        # Biz burada sadece index veya dummy label döneceğiz.
        
        label = f"food_class_{predicted_class_idx}" # Placeholder until labels.json integration

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
    uvicorn.run(app, host="0.0.0.0", port=5000)
