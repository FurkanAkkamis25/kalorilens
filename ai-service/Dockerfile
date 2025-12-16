# 1. Temel Olarak Python 3.9 Kullan
FROM python:3.9-slim

# 2. Çalışma Klasörünü Ayarla
WORKDIR /app

# 3. Gerekli Sistem Kütüphanelerini Yükle (DÜZELTİLDİ: libgl1 kullanıldı)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 4. Malzeme Listesini Kopyala ve Yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Senin Kodlarını İçeri Kopyala
COPY . .

# 6. Dışarıya 5000 Portunu Aç
EXPOSE 5000

# 7. Uygulamayı Başlat
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]