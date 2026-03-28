import ImageKit from 'imagekit';
import 'dotenv/config';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const testUpload = async () => {
    console.log('Testing Upload with endpoint:', process.env.IMAGEKIT_URL_ENDPOINT);
    try {
        const res = await imagekit.upload({
            file: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
            fileName: `test-${Date.now()}.png`,
            folder: 'quickgpt_test'
        });
        console.log('Upload Success! URL:', res.url);
    } catch (err) {
        console.log('Upload Fail!');
        console.log('Error:', err.message);
        console.log('Full Error:', JSON.stringify(err, null, 2));
    }
}

testUpload();
