const axios = require('axios');

async function test() {
    try {
        const barcode = '5449000000439'; // Sprite
        console.log(`Fetching product ${barcode}...`);

        try {
            const response = await axios.get(`http://localhost:3000/products/${barcode}`);
            console.log('Status:', response.status);
            const d = response.data;
            console.log('Ürün:', d.urun_adi);
            console.log('Kalori:', d.kalori);
            console.log('Protein:', d.protein);
            console.log('Karbonhidrat:', d.karbonhidrat);
            console.log('Yağ:', d.yag);

            if (d.kalori !== undefined) {
                console.log('SUCCESS: Nutritional info found.');
            } else {
                console.log('FAILURE: Nutritional info missing.');
            }

        } catch (e) {
            console.log(`Error: ${e.message}`);
            if (e.response) console.log(`Response: ${e.response.status}`);
        }
    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

test();
