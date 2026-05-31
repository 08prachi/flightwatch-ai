import { Queue } from "bullmq";
import { connection } from "../config/redis";

let priceCheckQueue: Queue | null = null;

try {
  priceCheckQueue = new Queue(
    "price-check-queue",
    {
      connection,
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }
  );
} catch (error: any) {
  console.error("Failed to initialize price check queue:", error.message);
  priceCheckQueue = null;
}

export { priceCheckQueue };