# Kalorilens - Mobil API Entegrasyon Dokümanı

## Genel Bilgiler
- **Base URL**: `http://<API_IP_ADRESI>:3000` (Geliştirme ortamı için)
- **Authentication**: Çoğu endpoint `Authorization: Bearer <JWT_TOKEN>` header'ı gerektirir.
- **Tarih Formatı**: ISO 8601 (örn. `2023-12-25T14:30:00Z`)

---

## 1. Authentication (Kimlik Doğrulama)

### 1.1. Login (Giriş)
Kullanıcı email ve şifresi ile giriş yapar. Başarılı olursa JWT token döner. Bu token diğer isteklerde kullanılmalıdır.

- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **İstek Body (JSON)**:
  ```json
  {
    "email": "user@example.com",
    "password": "secretPassword"
  }
  ```
- **Başarılı Yanıt (200)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 1.2. Register (Kayıt)
Yeni kullanıcı oluşturur.

- **Endpoint**: `/auth/register`
- **Method**: `POST`
- **İstek Body (JSON)**:
  ```json
  {
    "email": "user@example.com",     // Zorunlu
    "password": "secretPassword",    // Zorunlu
    "displayName": "Ad Soyad",       // Opsiyonel
    "age": 25,                       // Opsiyonel
    "heightCm": 180,                 // Opsiyonel
    "weightKg": 75,                  // Opsiyonel
    "activityLevel": "moderate",     // Opsiyonel (sedentary, light, moderate, active)
    "goalType": "maintain",          // Opsiyonel (lose_weight, maintain, gain_muscle)
    "firebaseUid": "FIREBASE_UID"    // Opsiyonel (Firebase Auht kullanılıyorsa)
  }
  ```
- **Başarılı Yanıt (201)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "displayName": "Ad Soyad",
    ...
  }
  ```

---

## 2. Kullanıcı İşlemleri (Users)

### 2.1. Profilimi Getir (Get Me)
Giriş yapmış kullanıcının profil detaylarını getirir. Bu endpoint şu an Firebase UID'si ile çalışacak şekilde kurgulanmış görünüyor.

- **Endpoint**: `/users/me`
- **Method**: `GET`
- **Header**:
  - `x-firebase-uid`: `<FIREBASE_USER_UID>` (JWT yerine bu header bekleniyor olabilir, kod kontrol edildiğinde bu görüldü)
- **Başarılı Yanıt (200)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "displayName": "Tarik",
    "age": 25,
    "heightCm": 175,
    "weightKg": 70,
    "bmr": 1700,
    "dailyCalories": 2400
  }
  ```

### 2.2. Profil Güncelle (Update Me)
Kullanıcı bilgilerini günceller.

- **Endpoint**: `/users/me`
- **Method**: `PUT`
- **Header**:
  - `x-firebase-uid`: `<FIREBASE_USER_UID>`
- **İstek Body (JSON)**:
  ```json
  {
    "displayName": "Yeni İsim",
    "weightKg": 72,
    "goalType": "lose_weight"
  }
  ```
- **Not**: Gönderilen alanlar güncellenir, gönderilmeyenler aynı kalır.

---

## 3. Hedefler (Goals)

### 3.1. Hedefleri Yeniden Hesapla
Kullanıcının kilo, boy, yaş vb. bilgilerine göre günlük kalori ve makro hedeflerini yeniden hesaplar.

- **Endpoint**: `/goals/recalc`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <TOKEN>`
- **Başarılı Yanıt (200)**:
  ```json
  {
    "dailyCalories": 2200,
    "dailyProtein": 150,
    "dailyCarbs": 250,
    "dailyFat": 70
  }
  ```

---

## 4. Yemek & Öğünler (Meals)

### 4.1. Yemek Kaydet (Create Meal)
Kullanıcının yediği bir öğünü kaydeder.

- **Endpoint**: `/meals`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <TOKEN>`
- **İstek Body (JSON)**:
  ```json
  {
    "name": "Öğle Yemeği",            // Öğün adı
    "totalCalories": 500,
    "totalProtein": 30,
    "totalCarbs": 45,
    "totalFat": 20,
    "imageUrl": "http://image-url...", // Opsiyonel
    "foods": [                         // Öğünün içindeki yemekler
      {
        "name": "Tavuk Göğsü",
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "amount": 100,
        "unit": "g"
      },
      {
        "name": "Pilav",
        "calories": 130,
        "protein": 2,
        "carbs": 28,
        "fat": 0.3,
        "amount": 100,
        "unit": "g"
      }
    ]
  }
  ```

---

## 5. Yapay Zeka & Tahmin (AI & Prediction)

### 5.1. Yemek Fotoğrafı Analizi (Authenticated)
Giriş yapmış kullanıcı için fotoğraf analizi yapar.

- **Endpoint**: `/ai/analyze`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <TOKEN>`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: (Binary Image File)
- **Başarılı Yanıt**:
  ```json
  {
    "label": "izmir_kofte",
    "score": 0.98,
    "image_url": "..."
  }
  ```

### 5.2. Hızlı Tahmin (Public / Ana Ekran)
Login olmadan veya ana ekranda hızlıca fotoğraf çekip ne olduğunu görmek için kullanılır. Veritabanındaki besin değerleriyle eşleştirip döner.

- **Endpoint**: `/predict`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: (Binary Image File)
- **Başarılı Yanıt (200)**:
  ```json
  {
    "food_name": "Kuru Fasulye",
    "calories": 300,
    "protein": 15,
    "fat": 5,
    "carbohydrate": 40,
    "image_url": "http://...",
    "match_score": 0.95
  }
  ```
- **Uyarı Durumu**: Eğer yemek veritabanında yoksa ancak AI tanıdıysa, kalori 0 dönebilir ve `warning` mesajı içerir.
