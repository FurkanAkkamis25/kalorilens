const express = require('express');
const mongoose = require('mongoose');
const stringSimilarity = require('string-similarity');
const fs = require('fs'); // YENİ: Node.js File System modülünü dahil et

// --- Tahlil Motorunu ve Yardımcı Fonksiyonları Dahil Et ---
const { normalizeText, generateTahlilWarning } = require('./tahlilEngine');

// KRİTİK DÜZELTME: Dosyayı require() yerine fs.readFileSync() ile oku
// Bu, require() hatasını kesin olarak aşar.
const TAHLIL_RULES_PATH = './infra/data/tahlil_kurallari.json';
let tahlilKurallari = {};

try {
    const rawData = fs.readFileSync(TAHLIL_RULES_PATH, 'utf8');
    const rawTahlilKurallariArray = JSON.parse(rawData);

    // Diziyi API'nin beklediği harita (dictionary) yapısına dönüştür
    tahlilKurallari = rawTahlilKurallariArray.reduce((map, item) => {
        map[item.marker] = item;
        return map;
    }, {});

    console.log(`[OK] Tahlil kuralları başarıyla yüklendi: ${Object.keys(tahlilKurallari).length} adet kural.`);

} catch (error) {
    console.error(`[HATA] Tahlil kurallarını yüklerken hata: ${error.message}`);
    // Dosya okunamadığı veya JSON formatı bozuk olduğu için sunucuyu başlatmayacağız.
    process.exit(1); 
}


// --- Konfigürasyonlar ---
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/kalorilens?authSource=admin';
const PORT = 3000; 

// --- Uygulama Başlatma ---
const app = express();
app.use(express.json());

// --- MongoDB Şeması ---
const FoodSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    calories: { type: Number, required: true }, 
    unit: String, 
    protein: Number, 
    carbohydrates: Number, 
    fat: Number
}, { collection: 'foods' }); 

const FoodModel = mongoose.model('Food', FoodSchema);


// --- API Endpoint: Bulanık Arama ve Eşleştirme (Değişmedi) ---
app.get('/api/search', async (req, res) => {
    // ... arama mantığı
    const searchTerm = req.query.q;
    // ... (Arama mantığının geri kalan kısmı aynı kalır)
    if (!searchTerm) {
        return res.status(400).json({ success: false, error: 'Arama terimi (q) gereklidir.' });
    }

    try {
        const normalizedSearch = normalizeText(searchTerm);
        const regex = new RegExp(normalizedSearch, 'i');

        const initialMatches = await FoodModel.find({ 
            name: { $regex: regex } 
        }).lean();

        if (initialMatches.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [], message: 'Eşleşme bulunamadı.' });
        }

        const targets = initialMatches.map(food => food.name);
        const bestMatches = stringSimilarity.findBestMatch(searchTerm, targets);
        
        const sortedMatches = bestMatches.ratings
            .filter(rating => rating.rating > 0.3) 
            .sort((a, b) => b.rating - a.rating)
            .map(rating => {
                const originalFood = initialMatches.find(food => food.name === rating.target);
                return { 
                    ...originalFood, 
                    similarity_score: rating.rating 
                };
            });

        res.status(200).json({ 
            success: true, 
            count: sortedMatches.length, 
            data: sortedMatches
        });

    } catch (error) {
        console.error("API hatası:", error.message);
        res.status(500).json({ success: false, error: 'Sunucu Hatası: ' + error.message });
    }
});


// --- YENİ API Endpoint: Kan Tahlili Kontrolü ---
app.get('/api/tahlil/check', (req, res) => {
    const { test, value } = req.query;

    if (!test || !value) {
        return res.status(400).json({ success: false, error: 'test ve value parametreleri gereklidir.' });
    }

    const numericValue = parseFloat(value);
    
    // Tahlil adını normalleştirip motoru çalıştırıyoruz
    const warnings = generateTahlilWarning(test, numericValue, tahlilKurallari);
    
    res.status(200).json({ success: true, test: test, result: warnings });
});


// --- Sunucuyu Başlatma ---
async function startServer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı: API hazır.');

        app.listen(PORT, () => {
            console.log(`API Sunucusu http://localhost:${PORT} adresinde dinliyor.`);
            console.log(`Tahlil Motoru Testi (Ferritin Yüksek): http://localhost:${PORT}/api/tahlil/check?test=ferritin&value=200`);
            console.log(`Tahlil Motoru Testi (B12 Düşük): http://localhost:${PORT}/api/tahlil/check?test=b12&value=150`);
        });
    } catch (error) {
        console.error('Sunucu başlatma hatası:', error.message);
        process.exit(1);
    }
}

startServer();