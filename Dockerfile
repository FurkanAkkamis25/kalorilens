# 1. Node.js imajını kullan
FROM node:18-alpine

# 2. Çalışma dizinini ayarla
WORKDIR /app

# 3. Bağımlılık dosyalarını kopyala
COPY apps/api/package*.json ./

# 4. Bağımlılıkları yükle
RUN npm install

# 5. Kaynak kodları kopyala
COPY apps/api/ .

# --- DÜZELTME BURADA ---
# Prisma'nın build sırasında hata vermemesi için geçici bir adres tanımlıyoruz.
# (Bu adres çalışmayacak ama build işleminin geçmesini sağlayacak)
ENV DATABASE_URL="postgresql://dummy:5432/dummy"

# 6. Prisma istemcisini oluştur
RUN npx prisma generate

# 7. Uygulamayı başlat
CMD ["npm", "run", "start:dev"]