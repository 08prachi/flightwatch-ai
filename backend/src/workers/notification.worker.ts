import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { emailService } from "../services/email.service";
import { prisma } from "../config/prisma";

const worker = new Worker(
  "notification-queue",
  async (job) => {
    try {
      console.log("📧 Notification Worker Received Job");
      console.log(`Type: ${job.data.type}`);

      const { email, userName, type, message, data } = job.data;

      // Route to appropriate email handler based on type
      switch (type) {
        case "price-drop":
          console.log("📉 Sending Price Drop Alert");
          await emailService.sendPriceDropAlert(
            email,
            userName,
            data.route,
            data.currentPrice,
            data.lowestPrice,
            data.savings,
            data.savingsPercentage
          );
          break;

        case "budget-alert":
          console.log("✨ Sending Budget Alert");
          await emailService.sendBudgetAlert(
            email,
            userName,
            data.route,
            data.currentPrice,
            data.budget,
            data.available
          );
          break;

        case "weekly-digest":
          console.log("📊 Sending Weekly Digest");
          await emailService.sendWeeklyDigest(
            email,
            userName,
            data.stats
          );
          break;

        case "signup-confirmation":
          console.log("✅ Sending Signup Confirmation");
          await emailService.sendSignupConfirmation(email, userName);
          break;

        case "price-analysis":
          console.log("🔍 Sending Price Analysis");
          await emailService.sendPriceAnalysis(
            email,
            userName,
            data.route,
            data.top3Cheapest,
            data.bestDay,
            data.currencySymbol || '$'
          );
          break;

        case "price-analysis-with-pdf":
          console.log("📄 Sending Price Analysis with PDF");
          const pdfBuffer = Buffer.from(data.pdfBuffer, 'base64');
          await emailService.sendPriceAnalysisWithPDF(
            email,
            userName,
            data.route,
            data.top3Cheapest,
            pdfBuffer,
            data.currencySymbol || '$'
          );
          break;

        default:
          console.log("📧 Sending Generic Notification");
          await emailService.sendEmail({
            to: email,
            subject: message,
            html: `<p>${message}</p>`,
          });
      }

      console.log(`✅ Email sent successfully to ${email}`);
    } catch (error: any) {
      console.error("❌ Notification Worker Error");
      console.error(error.message);
      throw error; // Re-throw for retry mechanism
    }
  },
  {
    connection: redis as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

console.log("👂 Notification Worker Started");