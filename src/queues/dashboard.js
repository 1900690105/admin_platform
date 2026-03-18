import express from "express";
import { Queue } from "bullmq";
import Redis from "ioredis";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

const connection = new Redis({
  maxRetriesPerRequest: null,
});

const productQueue = new Queue("productQueue", { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/queues");

createBullBoard({
  queues: [new BullMQAdapter(productQueue)],
  serverAdapter,
});

const app = express();

app.use("/queues", serverAdapter.getRouter());

app.listen(4000, () => {
  console.log("BullMQ dashboard running on http://localhost:4000/queues");
});
