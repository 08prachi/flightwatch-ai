import { priceCheckQueue } from "../queues/priceCheck.queue";

async function main() {
  const job = await priceCheckQueue.add(
    "check-flight-price",
    {
      watchId: 1,
      source: "BLR",
      destination: "DXB",
      flightType: "DIRECT",
    }
  );

  console.log("✅ Job Added");
  console.log("Job ID:", job.id);

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});