from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from PIL import Image
import tensorflow as tf
import numpy as np
import json
import io
import uvicorn
import os

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
    print("\n KaloriLens AI Servisi Başlatılıyor...")
    
    try:
        # 1. Modeli Yükle
        print(f"Model yükleniyor: {MODEL_PATH}")
        ai_models["model"] = tf.keras.models.load_model(MODEL_PATH)
        
        # 2. Etiketleri Yükle
        print(f"Etiketler yükleniyor: {LABELS_PATH}")
        ai_models["labels"] = load_labels()
        
        print("Sistem Hazır! İstek bekliyor...")
    except Exception as e:
        print(f"HATA: Model yüklenirken sorun oluştu: {e}")
    
    yield
    ai_models.clear()

app = FastAPI(title="KaloriLens AI Service", lifespan=lifespan)

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
    return {"status": "active", "model": "MobileNetV2", "message": "KaloriLens AI Hazır"}

@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    if "model" not in ai_models:
        raise HTTPException(status_code=500, detail="Model henüz yüklenmedi.")

    try:
        # Dosyayı Oku
        content = await file.read()
        image = Image.open(io.BytesIO(content))

        # Resmi Hazırla
        processed_image = prepare_image(image)

        # Tahmin Yap
        predictions = ai_models["model"].predict(processed_image)
        
        # En yüksek skoru bul
        score = float(np.max(predictions))
        class_index = np.argmax(predictions)
        
        # Etiketi bul
        labels = ai_models["labels"]
        if class_index < len(labels):
            label = labels[class_index]
        else:
            label = "Bilinmiyor"

        # Basit Kalori Tahmini (Demo İçin)
        nutrition_db = {
            "pizza": 266, "hamburger": 295, "dondurma": 207, 
            "elmali_turta": 237, "biftek": 271, "makarna": 131,
            "egitim_seti": 0 # Geçici Türk yemekleri etiketi
        }
        cal = nutrition_db.get(label, 200)

        return {
            "label": label,      
            "score": round(score * 100, 2), 
            "nutrition": {       
                "calories": cal,
                "protein": "Bilinmiyor", 
                "fat": "Bilinmiyor"
            }
        }

    except Exception as e:
        print(f"Hata detayı: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)