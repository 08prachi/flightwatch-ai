"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const email_service_1 = require("../services/email.service");
const worker = new bullmq_1.Worker("notification-queue", async (job) => {
    try {
        console.log("📧 Notification Worker Received Job");
        console.log(`Type: ${job.data.type}`);
        const { email, userName, type, message, data } = job.data;
        // Route to appropriate email handler based on type
        switch (type) {
            case "price-drop":
                console.log("📉 Sending Price Drop Alert");
                await email_service_1.emailService.sendPriceDropAlert(email, userName, data.route, data.currentPrice, data.lowestPrice, data.savings, data.savingsPercentage);
                break;
            case "budget-alert":
                console.log("✨ Sending Budget Alert");
                await email_service_1.emailService.sendBudgetAlert(email, userName, data.route, data.currentPrice, data.budget, data.available);
                break;
            case "weekly-digest":
                console.log("📊 Sending Weekly Digest");
                await email_service_1.emailService.sendWeeklyDigest(email, userName, data.stats);
                break;
            case "signup-confirmation":
                console.log("✅ Sending Signup Confirmation");
                await email_service_1.emailService.sendSignupConfirmation(email, userName);
                break;
            case "price-analysis":
                console.log("🔍 Sending Price Analysis");
                await email_service_1.emailService.sendPriceAnalysis(email, userName, data.route, data.top3Cheapest, data.bestDay, data.currencySymbol || '$');
                break;
            case "price-analysis-with-pdf":
                console.log("📄 Sending Price Analysis with PDF");
                const pdfBuffer = Buffer.from(data.pdfBuffer, 'base64');
                await email_service_1.emailService.sendPriceAnalysisWithPDF(email, userName, data.route, data.top3Cheapest, pdfBuffer, data.currencySymbol || '$');
                break;
            default:
                console.log("📧 Sending Generic Notification");
                await email_service_1.emailService.sendEmail({
                    to: email,
                    subject: message,
                    html: `<p>${message}</p>`,
                });
        }
        console.log(`✅ Email sent successfully to ${email}`);
    }
    catch (error) {
        console.error("❌ Notification Worker Error");
        console.error(error.message);
        throw error; // Re-throw for retry mechanism
    }
}, {
    connection: redis_1.redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    },
});
worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});
console.log("👂 Notification Worker Started");
