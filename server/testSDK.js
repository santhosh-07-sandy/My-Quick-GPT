import ImageKit from 'imagekit';
import 'dotenv/config';
import axios from 'axios';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const testSDKUrl = async () => {
    const prompt = 'apple';

    // Attempting to generate SIGNED URL via SDK
    const url = imagekit.url({
        path: `/ik-genimg-prompt-${prompt}/test-${Date.now()}.png`,
        signed: true,
        expireSeconds: 300
    });

    console.log('SDK Generated Signed URL:', url);

    try {
        const res = await axios.get(url, { timeout: 30000 });
        console.log('Signed URL Success! Status:', res.status);
    } catch (err) {
        console.log('Signed URL Fail! Status:', err.response?.status);
        console.log('Error:', err.message);
        if (err.response?.data) {
            console.log('Error Data:', err.response.data.toString().slice(0, 500));
        }
    }
}

testSDKUrl();
