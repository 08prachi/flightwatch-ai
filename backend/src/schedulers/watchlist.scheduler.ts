import cron from "node-cron";

import { prisma } from "../config/prisma";
import { priceCheckQueue } from "../queues/priceCheck.queue";

cron.schedule("0 */4 * * *", async () => {
  console.log("🔄 Running Scheduler - Checking prices for active watchlists");

  const watchlists =
    await prisma.watchlist.findMany({
      where: {
        active: true,
      },
      include: {
        user: true,
      },
    });

  console.log(`📋 Found ${watchlists.length} active watchlists`);

  for (const watchlist of watchlists) {
    await priceCheckQueue.add(
      "price-check",
      {
        watchlistId: watchlist.id,
      }
    );
  }

  console.log(
    `✅ Queued ${watchlists.length} price check jobs`
  );
});