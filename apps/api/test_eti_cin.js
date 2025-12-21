const axios = require('axios');

async function test() {
    try {
        const barcode = '5449000000996';
        console.log(`Fetching product ${barcode}...`);

        // Retry logic
        for (let i = 0; i < 10; i++) {
            try {
                const response = await axios.get(`http://localhost:3000/products/${barcode}`);
                console.log('Status:', response.status);
                console.log('Data:', JSON.stringify(response.data, null, 2));
                if (response.data.urun_adi) {
                    console.log('SUCCESS: Product found');
                    console.log('Ürün Adı:', response.data.urun_adi);
                    console.log('Marka:', response.data.marka);
                } else {
                    console.log('FAILURE: Product name missing');
                }
            } catch (e) {
                console.log(`Attempt ${i + 1} failed: ${e.message} ${e.code || ''}`);
                if (e.response) console.log(`Response: ${e.response.status}`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }
        console.log('Gave up.');
    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

test();
