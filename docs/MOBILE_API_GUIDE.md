# KaloriLens API - Mobil Geliştirici Rehberi

Bu belge, KaloriLens mobil uygulaması için backend servislerinin kullanımını açıklar.

## ⚠️ Önemli Notlar
1.  **Base URL:** `http://<IP_ADRESI>:3000` (Emülatör için genelde `10.0.2.2:3000`)
2.  **Auth Header:** Login gerektiren işlemlerde `Authorization: Bearer <TOKEN>` gönderilmelidir.
3.  **Firebase Header:** `/users/me` gibi kullanıcıya özel işlemlerde `x-firebase-uid: <UID>` header'ı **zorunludur**.

---

## 2. Authentication (Kimlik Doğrulama)

### 2.1. Kayıt Ol (Register)
*   **URL:** `/auth/register`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "email": "user@gmail.com",
      "password": "Password123!",
      "age": 25,
      "heightCm": 180,
      "weightKg": 75.5,
      "activityLevel": "moderate", // active, sedentary vb.
      "goalType": "maintain", // lose_weight, gain_muscle vb.
      "firebaseUid": "FIREBASE_UID_BURAYA" // Opsiyonel ama önerilir
    }
    ```
*   **Response (201):** Oluşturulan kullanıcı objesi.

### 2.2. Giriş Yap (Login)
*   **URL:** `/auth/login`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "email": "user@gmail.com",
      "password": "Password123!"
    }
    ```
*   **Response (200):**
    ```json
    {
      "access_token": "JWT_TOKEN...",
      "user": { "id": "...", "email": "..." }
    }
    ```

### 2.3. Token Doğrulama
*   **URL:** `/auth/verify-token`
*   **Method:** `POST`
*   **Body:** `{ "token": "FIREBASE_OR_JWT_TOKEN" }`

---

## 3. Kullanıcı İşlemleri (Users)

### 3.1. Profilimi Getir
*   **URL:** `/users/me`
*   **Method:** `GET`
*   **Headerlar:**
    *   `Authorization: Bearer <TOKEN>`
    *   `x-firebase-uid: <FIREBASE_UID>` (**Zorunlu**)
*   **Response (200):** Kullanıcı detayları.

### 3.2. Profilimi Güncelle
*   **URL:** `/users/me`
*   **Method:** `PUT`
*   **Headerlar:** (Üstteki ile aynı)
*   **Body:**
    ```json
    { "weightKg": 78, "activityLevel": "active" }
    ```

---

## 4. Yemek ve Ürün İşlemleri

### 4.1. Barkod ile Ürün Ara
*   **URL:** `/products/:barcode` (Örn: `/products/869123456`)
*   **Method:** `GET`
*   **Header:** `Authorization: Bearer <TOKEN>`
*   **Açıklama:** Veritabanında yoksa OpenFoodFacts'ten çeker.
*   **Response (200):**
    ```json
    {
      "urun_adi": "Nutella",
      "marka": "Ferrero",
      "kalori": 540,
      ...
    }
    ```

### 4.2. Yemek Ekle (Meals)
*   **URL:** `/meals`
*   **Method:** `POST`
*   **Header:** `Authorization: Bearer <TOKEN>`
*   **Body (Dikkat: 'foods' dizisi içerir):**
    ```json
    {
      "name": "Kahvaltı",
      "totalCalories": 300,
      "totalProtein": 15,
      "totalCarbs": 40,
      "totalFat": 10,
      "foods": [
        {
          "name": "Yumurta",
          "calories": 150,
          "protein": 12,
          "carbs": 1,
          "fat": 10,
          "amount": 2,
          "unit": "adet"
        }
      ]
    }
    ```

---

## 5. Yapay Zeka ve Hedefler

### 5.1. Resim Analizi (AI)
*   **URL:** `/ai/analyze`
*   **Method:** `POST`
*   **Header:** `Authorization: Bearer <TOKEN>`
*   **Body:** Multipart Form Data (`image` dosyası).

### 5.2. Hedefleri Yeniden Hesapla
*   **URL:** `/goals/recalc`
*   **Method:** `POST`
*   **Header:** `Authorization: Bearer <TOKEN>`

