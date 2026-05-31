"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const priceCheck_queue_1 = require("../queues/priceCheck.queue");
async function main() {
    const job = await priceCheck_queue_1.priceCheckQueue.add("check-flight-price", {
        watchId: 1,
        source: "BLR",
        destination: "DXB",
        flightType: "DIRECT",
    });
    console.log("✅ Job Added");
    console.log("Job ID:", job.id);
    process.exit(0);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
