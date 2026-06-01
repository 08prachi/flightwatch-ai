import { Router } from "express";
import { priceCheckQueue } from "../queues/priceCheck.queue";
import { notificationQueue } from "../queues/notification.queue";

const router = Router();

// Get queue counts (waiting, active, completed, failed, delayed)
router.get("/queues/status", async (req, res) => {
  try {
    const priceCheckStatus = await priceCheckQueue?.getJobCounts();
    const notificationStatus = await notificationQueue.getJobCounts();

    res.json({
      priceCheck: priceCheckStatus,
      notification: notificationStatus,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get all waiting jobs in queues
router.get("/queues/jobs", async (req, res) => {
  try {
    const priceCheckWaiting = await priceCheckQueue?.getWaiting(0, -1);
    const notificationWaiting = await notificationQueue.getWaiting(0, -1);

    const priceCheckActive = await priceCheckQueue?.getActive();
    const notificationActive = await notificationQueue.getActive();

    res.json({
      priceCheck: {
        waiting: priceCheckWaiting?.map((job) => ({
          id: job.id,
          data: job.data,
          state: "waiting",
          createdAt: job.createdAt,
        })),
        active: priceCheckActive?.map((job) => ({
          id: job.id,
          data: job.data,
          state: "active",
          progress: job.progress(),
          createdAt: job.createdAt,
        })),
      },
      notification: {
        waiting: notificationWaiting?.map((job) => ({
          id: job.id,
          data: job.data,
          state: "waiting",
          createdAt: job.createdAt,
        })),
        active: notificationActive?.map((job) => ({
          id: job.id,
          data: job.data,
          state: "active",
          progress: job.progress(),
          createdAt: job.createdAt,
        })),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get detailed info for a specific job
router.get("/queues/job/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    const priceCheckJob =
      await priceCheckQueue?.getJob(jobId);
    const notificationJob =
      await notificationQueue.getJob(jobId);

    const job = priceCheckJob || notificationJob;

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      id: job.id,
      queueName: job.queueName,
      data: job.data,
      state: await job.getState(),
      progress: job.progress(),
      attempts: job.attemptsMade,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      createdAt: job.createdAt,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
