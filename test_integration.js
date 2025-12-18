const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function runTests() {
    console.log('🧪 Starting API Tests...\n');

    // 1. Health Check
    try {
        const healthRes = await axios.get('http://localhost:3000');
        console.log('✅ Health Check: Passed', healthRes.data);
    } catch (err) {
        console.error('❌ Health Check: Failed', err.message);
        return;
    }

    // 2. Predict Endpoint
    try {
        const form = new FormData();
        // Using a sample file. If not found, we create a dummy one.
        const imagePath = path.resolve(__dirname, 'test_image.jpg');
        if (!fs.existsSync(imagePath)) {
            fs.writeFileSync(imagePath, 'dummy content'); // This might fail image validation if strict, but let's try or fetch a real one
        }
        // Accessing the file from ai-service to be sure it's an image
        // path: c:\Users\tarik\Desktop\kalorilens\ai-service\test_yemek.png
        const realImagePath = 'c:\\Users\\tarik\\Desktop\\kalorilens\\ai-service\\test_yemek.png';

        if (fs.existsSync(realImagePath)) {
            form.append('file', fs.createReadStream(realImagePath));
        } else {
            console.warn("⚠️ Warning: Real test image not found, skipping prediction test.");
            return;
        }

        console.log('\n📤 Sending Image to /predict...');
        const predictRes = await axios.post('http://localhost:3000/predict', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('✅ Prediction Result:', JSON.stringify(predictRes.data, null, 2));

    } catch (err) {
        console.error('❌ Prediction Test: Failed');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

runTests();
