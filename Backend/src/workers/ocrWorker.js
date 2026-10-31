
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

// Connect to Redis (requires REDIS_URL in .env)
const connection = new Redis(
    process.env.REDIS_URL || "redis://127.0.0.1:6379"
);

// 1. Create the Queue
const ocrQueue = new Queue("ocr-processing", { connection });


// 2. Create the Worker that processes jobs from the queue
const ocrWorker = new Worker(
    "ocr-processing",
    async (job) => {
        console.log(`Starting OCR for document: ${job.data.documentId}`);

        // Simulate a heavy AI OCR task taking 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));

        // In reality, you'd update the database here with the extracted text
        console.log(
            `Finished OCR for document: ${job.data.documentId}. Text extracted!`
        );

        return {
            success: true,
            extractedText: "Simulated ancient text..."
        };
    },
    { connection }
);

ocrWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed!`);
});

ocrWorker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export { ocrQueue };
