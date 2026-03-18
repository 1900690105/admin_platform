import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis();

export const productQueue = new Queue("productQueue", {
  connection,
});
