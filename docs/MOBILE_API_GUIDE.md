# KaloriLens API - Tam Dokümantasyon

Bu belge, backend üzerindeki **tüm** servisleri, endpoint'leri ve kullanım şekillerini içerir.

## 1. Genel Kurallar
*   **Base URL:** `http://<IP_ADRESI>:3000`
*   **Yetkilendirme:** Giriş yaptıktan sonra tüm korumalı isteklere header eklenmeli: `Authorization: Bearer <token>`
*   **Firebase Header:** Profil işlemlerinde `x-firebase-uid: <UID>` header'ı zorunludur.

---

## 2. Authentication (Kimlik Doğrulama)
`/auth` altındaki servisler

### 2.1. Kayıt Ol (Register)
*   **URL:** `/auth/register`
*   **Method:** `POST`
*   **Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "123",
      "age": 25,          // Zorunlu Number
      "heightCm": 180,    // Zorunlu Number
      "weightKg": 75.5,   // Zorunlu Number
      "activityLevel": "moderate",
      "goalType": "maintain"
    }
    ```

### 2.2. Giriş Yap (Login)
*   **URL:** `/auth/login`
*   **Method:** `POST`
*   **Body:**
    ```json
    { "email": "user@example.com", "password": "123" }
    ```
*   **Response:** `{ "access_token": "...", "user": {...} }`

### 2.3. Token Doğrulama (Verify)
*   **URL:** `/auth/verify-token`
*   **Method:** `POST`
*   **Header:** `Authorization: Bearer <token>`

---

## 3. Kullanıcı İşlemleri (Users)
`/users` altındaki servisler

### 3.1. Profilimi Getir
*   **URL:** `/users/me`
*   **Method:** `GET`
*   **Headerlar:**
    *   `Authorization: Bearer <token>`
    *   `x-firebase-uid: <FIREBASE_UID>` (**Zorunlu**)
*   **Response:** Kullanıcı bilgileri ve günlük özetler.

### 3.2. Profilimi Güncelle
*   **URL:** `/users/me`
*   **Method:** `PUT`
*   **Headerlar:** Same as above.
*   **Body:** (Güncellenecek alanlar)
    ```json
    { "weightKg": 78, "activityLevel": "active" }
    ```

---

## 4. Yemek ve Ürün İşlemleri

### 4.1. Barkod ile Ürün Ara (Products)
*   **URL:** `/products/:barcode` (Örn: `/products/869123456`)
*   **Method:** `GET`
*   **Header:** `Authorization: Bearer <token>`
*   **Açıklama:** Veritabanında yoksa otomatik olarak OpenFoodFacts'ten çeker ve kaydeder.

### 4.2. Yemek Ekle (Meals)
*   **URL:** `/meals`
*   **Method:** `POST`
*   **Header:** `Authorization: Bearer <token>`
*   **Body:**
    ```json
    {
      "name": "Elma",
      "calories": 52,
      "protein": 0.3,
      "carbs": 14,
      "fat": 0.2,
      "amount": 100,
      "unit": "g"
    }
    ```

---

## 5. Yapay Zeka ve Hedefler

### 5.1. Resim Analizi (AI)
*   **URL:** `/ai/analyze`
*   **Method:** `POST`
*   **Header:** `Authorization: Bearer <token>`
*   **Body:** Multipart Form Data (Resim dosyası 'image' key'i ile).

### 5.2. Hedefleri Yeniden Hesapla (Goals)
*   **URL:** `/goals/recalc`
*   **Method:** `POST`
*   **Header:** `Authorization: Bearer <token>`
*   **Body:** `{ "userId": "..." }`
