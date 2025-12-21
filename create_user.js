const axios = require('axios');

async function createUser() {
    const email = 'test@kalorilens.com';
    const password = 'password123';

    try {
        console.log('⏳ Kullanıcı oluşturuluyor...');
        const response = await axios.post('http://localhost:3000/auth/register', {
            email: email,
            password: password,
            ad_soyad: 'Test Kullanıcı',
            firebaseUid: 'test_uid_12345' // Sabit ID test için
        });
        console.log('✅ KULLANICI OLUŞTURULDU!');
        console.log('-----------------------------------');
        console.log(`✉️  Email: ${email}`);
        console.log(`🔑 Şifre: ${password}`);
        console.log('-----------------------------------');
    } catch (error) {
        if (error.response && (error.response.status === 409 || error.response.status === 400)) {
             console.log('✅ KULLANICI ZATEN VAR (Sorun yok)');
             console.log('-----------------------------------');
             console.log(`✉️  Email: ${email}`);
             console.log(`🔑 Şifre: ${password}`);
             console.log('-----------------------------------');
             console.log('Bu bilgilerle giriş yapabilirsiniz.');
        } else {
            console.error('❌ BEKLENMEYEN HATA:', error.message);
            if (error.response) console.error('Detay:', error.response.data);
        }
    }
}

createUser();
