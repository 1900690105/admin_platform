import { Worker } from "bullmq";
import Redis from "ioredis";
import { logger } from "../lib/logger.js";

console.log("Worker starting...");

const connection = new Redis({
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "productQueue",
  async (job) => {
    console.log("Processing job:", job.name);

    logger.info(`Processing job ${job.name}`);

    if (job.name === "product-created") {
      const { productId } = job.data;

      logger.info({ productId }, "Processing product job");
    }
  },
  { connection },
);

console.log("Worker is waiting for jobs...");
