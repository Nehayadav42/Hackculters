import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import monumentRoutes from './routes/monument.routes.js'; 
import aiRoutes from './routes/ai.routes.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Your teammate's Vite frontend port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the new Supabase routes
app.use('/api/v1/monuments', monumentRoutes);
app.use('/api/v1/ai', aiRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;