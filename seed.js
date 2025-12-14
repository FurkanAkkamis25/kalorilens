const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Load .env file
const csv = require('csv-parser');
const mongoose = require('mongoose');

// --- Konfigürasyonlar ---
const CSV_FILE_NAME = 'Yemeklik Liste.csv';
const CSV_FILE_PATH = path.join(__dirname, 'infra', 'data', CSV_FILE_NAME);
// Kimlik doğrulama, port ve veritabanı adresi ayarlandı
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('Hata: MONGO_URI ortam değişkeni tanımlanmamış! Lütfen .env dosyasını kontrol edin.');
    process.exit(1);
}


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
    }


    // 3. CSV Dosyasını Oku ve İşle (Tüm Hata Düzeltmeleri Uygulandı)
    let parsedData = [];

    try {
        const results = await new Promise((resolve, reject) => {
            const tempResults = [];

            // Kodlama (latin1) ayarlandı.
            fs.createReadStream(CSV_FILE_PATH, { encoding: 'latin1' })
                .pipe(csv({
                    separator: ';', // Noktalı virgül ayırıcısı
                    // KRİTİK DÜZELTME: Bozulmuş başlıkları manuel olarak İngilizce anahtarlara eşle
                    mapHeaders: ({ header }) => {
                        const trimmedHeader = header ? header.trim() : null;

                        // DEBUG ÇIKTISINA GÖRE GÜNCELLENMİŞ EŞLEŞTİRMELER:
                        if (trimmedHeader === 'Yemek Adý') return 'name'; // Bozulmuş başlık eşleşmesi!
                        if (trimmedHeader === 'Kalori (kcal)') return 'calories';
                        if (trimmedHeader === 'Birim') return 'unit';
                        if (trimmedHeader === 'Protein (gr)') return 'protein';
                        if (trimmedHeader === 'Karbonhidrat (gr)') return 'carbohydrates';
                        if (trimmedHeader === 'Yað (gr)') return 'fat'; // Bozulmuş başlık eşleşmesi!
                        return null;
                    }
                }))
                .on('data', (data) => {
                    // Sayısal alanlar için virgül/nokta temizliği yapıyoruz
                    const caloriesVal = String(data.calories).replace(',', '.');
                    const proteinVal = String(data.protein).replace(',', '.');
                    const carbVal = String(data.carbohydrates).replace(',', '.');
                    const fatVal = String(data.fat).replace(',', '.');

                    // Veri dönüşüm mantığı (İngilizce Anahtarları Kullanıyoruz)
                    const foodItem = {
                        name: data.name,
                        unit: data.unit,
                        calories: parseFloat(caloriesVal),
                        protein: parseFloat(proteinVal),
                        carbohydrates: parseFloat(carbVal),
                        fat: parseFloat(fatVal)
                    };

                    // Geçerlilik kontrolü
                    if (!isNaN(foodItem.calories) && foodItem.name && foodItem.name.trim() !== '') {
                        tempResults.push(foodItem);
                    }
                })
                .on('end', () => resolve(tempResults))
                .on('error', (err) => reject(err));
        });

        parsedData = results;
        console.log(`CSV'den ${parsedData.length} geçerli kayıt okundu ve işlendi.`);
    } catch (error) {
        console.error('Veri okuma veya işleme hatası:', error.message);
        await mongoose.connection.close();
        return;
    }

    // 4. Verileri Veritabanına Kaydet
    if (parsedData.length > 0) {
        try {
            await FoodModel.insertMany(parsedData);
            console.log(`Toplam ${parsedData.length} veri başarıyla veritabanına kaydedildi.`);
        } catch (error) {
            console.error('Veritabanına kayıt hatası (Çift kayıt olabilir):', error.message);
        }
    }


    // 5. Bağlantıyı Kapat
    mongoose.connection.close();
    console.log('Besleme işlemi tamamlandı.');
}

// Fonksiyonu çalıştır
seedDatabase();