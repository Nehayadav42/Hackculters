const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const locationRoutes = require('./routes/location.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Routes
app.use('/api/v1/locations', locationRoutes);

// Centralized Error Handling Middleware (Catches all backend crashes safely)
app.use(errorHandler);

module.exports = app;