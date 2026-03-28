import axios from 'axios';

async function run() {
    try {
        console.log("Fetching community images before test...");
        let res = await axios.get('http://localhost:3000/api/user/published-images');
        console.log("Images count:", res.data.images?.length);
        
        console.log("Registering dummy user...");
        const rnd = Math.random().toString(36).substring(7);
        const registerRes = await axios.post('http://localhost:3000/api/user/register', {
            name: 'TestUser ' + rnd,
            email: `test${rnd}@example.com`,
            password: 'password123'
        });
        const token = registerRes.data.token;
        console.log("Token:", token);
        
        console.log("Creating new chat...");
        const chatRes = await axios.get('http://localhost:3000/api/chat/create', {
            headers: { Authorization: token }
        });
        // We need to fetch chats to get the ID, but wait, createChat just returns success.
        const chatsRes = await axios.get('http://localhost:3000/api/chat/get', {
            headers: { Authorization: token }
        });
        const chatId = chatsRes.data.chats[0]._id;
        console.log("Chat ID:", chatId);
        
        console.log("Generating image with isPublished=true...");
        const msgRes = await axios.post('http://localhost:3000/api/message/image', {
            chatId,
            prompt: 'A test shiny apple ' + rnd,
            isPublished: true
        }, {
            headers: { Authorization: token }
        });
        console.log("Image generation success:", msgRes.data.success);
        console.log("Reply:", JSON.stringify(msgRes.data.reply));
        
        console.log("Fetching community images after test...");
        let res2 = await axios.get('http://localhost:3000/api/user/published-images');
        console.log("Images count:", res2.data.images?.length);
        console.log("Most recent image:", JSON.stringify(res2.data.images[0]));
        
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
run();
