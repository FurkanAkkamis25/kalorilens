const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
let AUTH_TOKEN = '';
let USER_ID = '';

// Renkli çıktılar için
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

async function runTests() {
    console.log(`${colors.blue}=== KaloriLens Endpoint Testleri Başlıyor ===${colors.reset}\n`);

    try {
        // 1. Register Test
        await testRegister();

        // 2. Login Test
        await testLogin();

        // 3. Verify Token
        // Sadece login başarılıysa
        if (AUTH_TOKEN) {
            await testVerifyToken();
            await testGetProfile();
            await testUpdateProfile();
            await testGetProductByBarcode();
            await testAddMeal();
            // await testAIAnalysis(); // İsteğe bağlı, resim gerekebilir
        } else {
            console.log(`${colors.red}[SKIP] Token alınamadığı için diğer testler atlandı.${colors.reset}`);
        }

    } catch (error) {
        console.error(`${colors.red}Test çalıştırılırken beklenmeyen hata:${colors.reset}`, error.message);
    }
}


async function testRegister() {
    console.log(`${colors.yellow}[TEST] Register (Kayıt Ol)${colors.reset}`);
    const email = `testuser_${Date.now()}@example.com`;
    const payload = {
        email: email,
        password: "Password123!",
        age: 25,
        heightCm: 180,
        weightKg: 75.5,
        activityLevel: "moderate",
        goalType: "maintain",
        firebaseUid: "test_firebase_uid_123" // DÜZELTME: Profil işlemleri için gerekli
    };

    try {
        const res = await axios.post(`${BASE_URL}/auth/register`, payload);
        if (res.status === 201 || res.status === 200) {
            console.log(`${colors.green}[SUCCESS] Register başarılı: ${email}${colors.reset}`);
            // Global değişkeni de güncelleyelim ki diğer testler bunu kullansın
            // Ancak login fonksiyonu kendi user'ını yaratıyor, o yüzden login testindeki user'a da uid eklemeliyiz.
        } else {
            console.log(`${colors.red}[FAIL] Register status: ${res.status}${colors.reset}`);
        }
    } catch (err) {
        console.log(`${colors.red}[FAIL] Register hatası:${colors.reset}`, err.response ? err.response.data : err.message);
    }
}

async function testLogin() {
    console.log(`\n${colors.yellow}[TEST] Login (Giriş Yap)${colors.reset}`);

    const email = `login_test_${Date.now()}@test.com`;
    const password = "Password123!";
    const firebaseUid = `uid_${Date.now()}`; // Unique UID

    // Login testi için user yarat (UID ile)
    try {
        await axios.post(`${BASE_URL}/auth/register`, {
            email, password, age: 30, heightCm: 170, weightKg: 70,
            activityLevel: "active", goalType: "lose_weight",
            firebaseUid: firebaseUid
        });
    } catch (e) {
        // Zaten varsa sorun yok, devam et
    }

    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        if (res.data.access_token) {
            AUTH_TOKEN = res.data.access_token;
            USER_ID = res.data.user ? res.data.user.id : null;
            // Testlerde kullanacağımız UID'yi güncelle
            global.TEST_FIREBASE_UID = firebaseUid;
            console.log(`${colors.green}[SUCCESS] Login başarılı. Token alındı.${colors.reset}`);
        } else {
            console.log(`${colors.red}[FAIL] Login yanıtında token yok.${colors.reset}`);
        }
    } catch (err) {
        console.log(`${colors.red}[FAIL] Login hatası:${colors.reset}`, err.response ? err.response.data : err.message);
    }
}

async function testVerifyToken() {
    console.log(`\n${colors.yellow}[TEST] Verify Token (Token Kontrol)${colors.reset}`);
    try {
        // POST /auth/verify-token (Dokümandaki gibi)
        await axios.post(`${BASE_URL}/auth/verify-token`, {}, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });
        console.log(`${colors.green}[SUCCESS] Verify Token başarılı.${colors.reset}`);
    } catch (err) {
        console.log(`${colors.red}[FAIL] Verify Token hatası:${colors.reset}`, err.response ? err.response.status : err.message);
    }
}

async function testGetProfile() {
    console.log(`\n${colors.yellow}[TEST] Get Profile (Profil Getir)${colors.reset}`);
    try {
        const res = await axios.get(`${BASE_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${AUTH_TOKEN}`,
                'x-firebase-uid': global.TEST_FIREBASE_UID // Login adımında set ettiğimiz UID
            }
        });
        console.log(`${colors.green}[SUCCESS] Profil getirildi: ${res.data.email} (ID: ${res.data.id})${colors.reset}`);
    } catch (err) {
        console.log(`${colors.red}[FAIL] Get Profile hatası (UID: ${global.TEST_FIREBASE_UID}):${colors.reset}`, err.response ? err.response.status : err.message);
    }
}

async function testUpdateProfile() {
    console.log(`\n${colors.yellow}[TEST] Update Profile (Profil Güncelle)${colors.reset}`);
    try {
        const res = await axios.put(`${BASE_URL}/users/me`,
            { weightKg: 80 },
            {
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                    'x-firebase-uid': global.TEST_FIREBASE_UID
                }
            }
        );
        console.log(`${colors.green}[SUCCESS] Profil güncellendi. Yeni kilo: ${res.data.weightKg}${colors.reset}`);
    } catch (err) {
        console.log(`${colors.red}[FAIL] Update Profile hatası:${colors.reset}`, err.response ? err.response.status : err.message);
    }
}

async function testGetProductByBarcode() {
    console.log(`\n${colors.yellow}[TEST] Get Product (Barkod ile Arama)${colors.reset}`);
    // Nutella 400g Barkodu: 3017620422003 (Dünya genelinde geçerli)
    const barcode = '3017620422003';
    try {
        const res = await axios.get(`${BASE_URL}/products/${barcode}`, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });
        console.log(`${colors.green}[SUCCESS] Ürün bulundu: ${res.data.urun_adi} (${res.data.marka})${colors.reset}`);
    } catch (err) {
        console.log(`${colors.red}[FAIL] Ürün getirme hatası:${colors.reset}`, err.response ? err.response.status : err.message);
    }
}

async function testAddMeal() {
    console.log(`\n${colors.yellow}[TEST] Add Meal (Yemek Ekle)${colors.reset}`);
    // DTO'ya uygun format
    const mealPayload = {
        name: "Akşam Yemeği",
        foods: [
            {
                name: "Tavuk Göğsü",
                calories: 165,
                protein: 31,
                carbs: 0,
                fat: 3.6,
                amount: 100,
                unit: "g"
            }
        ],
        totalCalories: 165,
        totalProtein: 31,
        totalCarbs: 0,
        totalFat: 3.6
    };

    try {
        const res = await axios.post(`${BASE_URL}/meals`,
            mealPayload,
            {
                headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
            }
        );
        console.log(`${colors.green}[SUCCESS] Yemek eklendi. ID: ${res.data.meal._id || res.data.meal.id}${colors.reset}`);
    } catch (err) {
        console.log(`${colors.red}[FAIL] Yemek ekleme hatası:${colors.reset}`, err.response ? err.response.status : err.message);
        if (err.response && err.response.data) console.log(JSON.stringify(err.response.data));
    }
}


runTests();
