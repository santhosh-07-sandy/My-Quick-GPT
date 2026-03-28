import axios from 'axios';
import 'dotenv/config';

const testImageKit = async () => {
    const prompt = 'A futuristic city at night';
    const encodedPrompt = encodeURIComponent(prompt);
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    // Pattern 1: Current code
    const url1 = `${endpoint}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    // Pattern 2: Typical ImageKit transformation pattern
    const url2 = `${endpoint}/tr:ik-genimg-prompt:${encodedPrompt}/quickgpt/${Date.now()}.png`;

    console.log('Testing Pattern 1:', url1);
    try {
        const res1 = await axios.get(url1, { timeout: 35000 });
        console.log('Pattern 1 Success, Status:', res1.status);
    } catch (err) {
        console.log('Pattern 1 Fail, Status:', err.response?.status, 'Error:', err.message);
    }

    console.log('Testing Pattern 2:', url2);
    try {
        const res2 = await axios.get(url2, { timeout: 15000 });
        console.log('Pattern 2 Success, Status:', res2.status);
    } catch (err) {
        console.log('Pattern 2 Fail, Status:', err.response?.status, 'Error:', err.message);
    }
}

testImageKit().catch(err => {
    console.error('Unhandled error in test script:', err);
});
