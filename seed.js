const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'apps', 'api', '.env') }); // Load .env file
const mongoose = require('mongoose');

// --- Konfigürasyonlar ---
// JSON dosyasını okumak için yolu tanımlıyoruz
const JSON_FILE_NAME = 'foods_seed_data.json';
const JSON_FILE_PATH = path.join(__dirname, 'infra', 'data', JSON_FILE_NAME);
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('Hata: MONGO_URI ortam değişkeni tanımlanmamış! Lütfen .env dosyasını kontrol edin.');
    process.exit(1);
}
// --- MongoDB Şeması ---
const FoodSchema = new mongoose.Schema({
    // KRİTİK: AI model eşleşmesi için slug alanı eklendi
    slug: { type: String, required: true, unique: true, index: true }, 
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    // unit ve fat alanları görev tanımında istenmediği için kaldırıldı
}, { collection: 'foods' });

const FoodModel = mongoose.model('Food', FoodSchema);


// --- Ana Seed Fonksiyonu ---
async function seedDatabase() {
    console.log('Veritabanı besleme işlemi başlatılıyor...');

    // 1. MongoDB'ye Bağlan
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB bağlantısı başarılı.');
    } catch (error) {
        console.error('MongoDB bağlantı hatası: Veritabanınızın (Docker) çalışıp çalışmadığını kontrol edin!', error.message);
        return;
    }

    // 2. Mevcut Koleksiyonu Temizle 
    try {
        await FoodModel.deleteMany({});
        console.log('Mevcut "foods" koleksiyonu temizlendi.');
    } catch (error) {
        console.error('Koleksiyon temizlenirken hata:', error.message);
        // Bağlantıyı kapatıp çıkış yapabiliriz
        mongoose.connection.close();
        return;
    }


    // 3. JSON Dosyasını Oku ve İşle (Yeni verilerimizi yüklüyoruz)
    let foodsData = [];

    try {
        const jsonString = fs.readFileSync(JSON_FILE_PATH, 'utf8');
        foodsData = JSON.parse(jsonString);
        
        console.log(`JSON dosyasından toplam ${foodsData.length} yemek verisi okundu.`);

        // 4. Verileri Veritabanına Kaydet
        if (foodsData.length > 0) {
            await FoodModel.insertMany(foodsData);
            console.log(`Toplam ${foodsData.length} yemek verisi başarıyla "foods" koleksiyonuna kaydedildi.`);
        } else {
            console.warn('UYARI: Yüklenecek veri bulunamadı. Lütfen foods_seed_data.json dosyasını kontrol edin.');
        }

    } catch (error) {
        console.error('Veri yüklenirken veya JSON okunurken HATA oluştu:', error.message);
        // Eğer yükleme sırasında duplicate key hatası alınırsa da buraya düşer.
    }


    // 5. Bağlantıyı Kapat
    mongoose.connection.close();
    console.log('Besleme işlemi tamamlandı. MongoDB bağlantısı kapatıldı.');
}

// Fonksiyonu çalıştır
seedDatabase();