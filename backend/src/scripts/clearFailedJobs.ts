import { priceCheckQueue } from "../queues/priceCheck.queue";
import { notificationQueue } from "../queues/notification.queue";

async function clearFailedJobs() {
  try {
    console.log("🔍 Checking failed jobs...\n");

    // Get failed jobs from priceCheckQueue
    const failedPriceCheckJobs = await priceCheckQueue?.getFailed(0, -1);
    console.log(`❌ Failed priceCheck jobs: ${failedPriceCheckJobs?.length || 0}`);

    if (failedPriceCheckJobs && failedPriceCheckJobs.length > 0) {
      for (const job of failedPriceCheckJobs) {
        console.log(`  - Job ${job.id}: ${job.failedReason}`);
        await job.remove();
      }
      console.log(`✅ Removed ${failedPriceCheckJobs.length} failed priceCheck jobs\n`);
    }

    // Get failed jobs from notificationQueue
    const failedNotificationJobs = await notificationQueue.getFailed(0, -1);
    console.log(`❌ Failed notification jobs: ${failedNotificationJobs?.length || 0}`);

    if (failedNotificationJobs && failedNotificationJobs.length > 0) {
      for (const job of failedNotificationJobs) {
        console.log(`  - Job ${job.id}: ${job.failedReason}`);
        await job.remove();
      }
      console.log(`✅ Removed ${failedNotificationJobs.length} failed notification jobs\n`);
    }

    // Show current status
    const priceCheckStatus = await priceCheckQueue?.getJobCounts();
    const notificationStatus = await notificationQueue.getJobCounts();

    console.log("📊 Queue Status After Cleanup:");
    console.log("Price Check:", priceCheckStatus);
    console.log("Notification:", notificationStatus);

    await priceCheckQueue?.close();
    await notificationQueue.close();
    console.log("\n🎉 Cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

clearFailedJobs();
