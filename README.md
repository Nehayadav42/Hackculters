🏛️ HeritageVerse - Backend API

Problem Statement: HC26-CULT01 - Digital Archiving and Interactive Exploration of Indian Heritage.

HeritageVerse is a robust, scalable Node.js backend designed to power a digital heritage museum. It provides a seamless API for geospatial mapping, 3D immersive viewing, archival document search, and an AI-powered research assistant. By utilizing message queues and cloud storage, the system ensures high performance even when processing heavy historical manuscripts and point-cloud data.

🏗️ System Architecture

Our backend relies on a modern, decoupled architecture designed for high availability and asynchronous processing.

graph TD
    Client[Frontend Client] -->|REST API| Express(Express.js Server)
    Express -->|Location & Metadata| Supabase[(Supabase / PostgreSQL)]
    Express -->|Image/PDF Uploads| Cloudinary☁️
    Express -->|Queue OCR Jobs| Redis((Redis))
    Redis --> Worker[BullMQ Background Worker]
    Worker -->|Extracts Text| Worker
    Worker -->|Updates Document| Supabase
    Express -->|Chat & Summarize| AI[AI Processing API]


✨ Core Features Built for the Hackathon

📍 Geospatial Data Pipeline: Delivers optimized coordinate payloads (lat/lng) to render thousands of historical sites on an interactive map.

🔍 Archival NLP & Global Search: Allows users to search not just monument titles, but inside the actual historical documents using text extracted via OCR.

⚙️ Asynchronous Background Workers: Heavy tasks like Optical Character Recognition (OCR) are handled by a BullMQ/Redis worker, preventing server blocking during manuscript uploads.

🤖 AI Research Assistant: Integrated AI endpoints to summarize lengthy archaeological reports and answer chat queries based on archival data.

🧊 3D Model Telemetry: Feeds geometric points and wireframe URLs to the frontend's WebGL reconstruction simulator.

☁️ Secure Cloud Storage: Files are processed via Multer and securely stored in Cloudinary.

💻 Tech Stack

Runtime: Node.js

Framework: Express.js

Database: Supabase (PostgreSQL)

Message Broker / Queue: Redis & BullMQ

Cloud Storage: Cloudinary & Multer

Security & Utils: CORS, dotenv

🚀 Local Development Setup

1. Clone the repository

git clone <your-repo-url>
cd backend


2. Install dependencies

npm install


3. Environment Variables

Create a .env file in the root directory and add your credentials:

PORT=5000

# Supabase Connection
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (For BullMQ)
REDIS_URL=redis://127.0.0.1:6379


4. Start the server

# Starts server with Nodemon for development
npm run dev


📡 API Endpoints Documentation

Monuments & Map

GET /api/v1/monuments/map-data - Fetch all location pins for the interactive map.

GET /api/v1/monuments/latest - Fetch the newest arrivals for the landing page carousel.

GET /api/v1/monuments - Fetch monuments (Supports query filters: ?state=Gujarat&category=Temple).

GET /api/v1/monuments/:id - Get detailed information and associated documents for a specific monument.

Search & Interactive Media

GET /api/v1/monuments/search/all?q=query - Global search across monument names and OCR-extracted document text.

GET /api/v1/monuments/:id/3d-model - Fetch geometry data and model URLs for the 3D viewer.

GET /api/v1/monuments/manuscript/:word - Fetch Sanskrit transliteration and English translations.

Uploads & Processing

POST /api/v1/monuments/upload - Upload an image/PDF. (Triggers background OCR worker if type is 'Manuscript').

AI Assistant

POST /api/v1/ai/summarize - Generate an AI summary for a specific document.

POST /api/v1/ai/chat - Ask the AI a question about a specific monument.
