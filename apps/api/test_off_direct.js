const axios = require('axios');

async function testLogic() {
    const barcode = '8690526015842';
    try {
        console.log(`Fetching from OpenFoodFacts for ${barcode}...`);
        const response = await axios.get(
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        );
        const data = response.data;
        if (data.status === 0 || !data.product) {
            console.log('Product not found on OFF');
            return;
        }

        const productData = data.product;
        const cleanData = {
            barcode: barcode,
            product_name: productData.product_name || 'Unknown Product',
            brands: productData.brands || 'Unknown Brand',
            image_url: productData.image_url || '',
        };

        console.log('Cleaned Data:', cleanData);
        console.log('SUCCESS: Logic working.');
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testLogic();
