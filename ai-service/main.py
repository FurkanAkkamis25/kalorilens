from transformers import ViTImageProcessor, ViTForImageClassification
from PIL import Image
import torch

# Food-101 dataset ile eğitilmiş model
MODEL_NAME = "nateraw/food"

def predict_food(image_path):
    print(f"Processing image: {image_path}...")
    
    try:
        # Model ve processor yükleme
        processor = ViTImageProcessor.from_pretrained(MODEL_NAME)
        model = ViTForImageClassification.from_pretrained(MODEL_NAME)

        # Görüntü işleme (RGBA -> RGB dönüşümü dahil)
        image = Image.open(image_path).convert('RGB')

        # Tahmin yürütme
        inputs = processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        # En yüksek olasılıklı sınıfı bulma
        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        label = model.config.id2label[predicted_class_idx]
        
        # Sonucu temiz bir şekilde yazdır
        print(f"\nPrediction Result: {label.upper()}")
        return label
        
    except FileNotFoundError:
        print(f"Error: File not found at {image_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Test görseli
    img_path = "test_yemek.png" 
    predict_food(img_path)