import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

console.log('Connecting to', process.env.MONGODB_URI + '/quickgpt');

mongoose.connect(process.env.MONGODB_URI + '/quickgpt').then(async () => {
    const Chat = mongoose.model('Chat', new mongoose.Schema({
        userName: String,
        messages: []
    }, { strict: false }));
    const chats = await Chat.find({});
    console.log('Total chats:', chats.length);
    
    chats.forEach(c => {
        c.messages.forEach(m => {
            if (m.isImage) {
                console.log(`Image: isPublished=${m.isPublished}, content=${m.content.slice(0,30)}...`);
            }
        });
    });
    
    const published = await Chat.aggregate([
        {$unwind: "$messages"},
        {$match: {"messages.isImage": true, "messages.isPublished": true}},
        {$project: {_id: 0, imageUrl: "$messages.content", userName: "$userName"}}
    ]);
    console.log('Aggregation result:', JSON.stringify(published, null, 2));
    
    process.exit(0);
}).catch(console.error);
