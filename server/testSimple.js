import axios from 'axios';
import 'dotenv/config';

const testSimple = async () => {
    const prompt = 'apple';
    const endpoint = 'https://ik.imagekit.io/santhoshD';

    // Pattern from search/SDK
    const url = `${endpoint}/tr:ik-genimg-prompt:${prompt},w-800,h-800/test-${Date.now()}.png`;

    console.log('Testing Simple URL:', url);
    try {
        const res = await axios.get(url, { timeout: 30000 });
        console.log('Success! Status:', res.status);
        console.log('Image Data Length:', res.data.length);
    } catch (err) {
        console.log('Fail! Status:', err.response?.status);
        console.log('Error Message:', err.message);
        if (err.response?.data) {
            console.log('Error Data:', err.response.data.toString().slice(0, 500));
        }
    }
}

testSimple();
