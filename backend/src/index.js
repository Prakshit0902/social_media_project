import dotenv from "dotenv";
import connectDB from "./config/db/index.js";
import { app } from "./app.js";
import { createServer } from 'http';
import { initializeSocketIO } from './socket/socketHandlers.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(server);

// Make io accessible in routes
app.set('io', io);

connectDB()
    .then(() => {
        // IMPORTANT: Use 'server.listen' not 'app.listen'
        server.listen(PORT, () => {
            console.log(`Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });