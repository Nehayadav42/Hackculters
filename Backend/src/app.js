import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import monumentRoutes from './routes/monument.routes.js'; // Updated import

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the new Supabase routes
app.use('/api/v1/monuments', monumentRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;