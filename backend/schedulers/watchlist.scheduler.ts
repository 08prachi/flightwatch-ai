// Scheduler: watchlist.scheduler.ts
// Periodically enqueues price check jobs for active watchlists.

import createPriceCheckQueue, { PRICE_CHECK_QUEUE } from '../queues/priceCheck.queue';

export function startWatchlistScheduler({
  connection,
  intervalMs = 60_000,
  enqueueFn,
}: {
  connection?: any;
  intervalMs?: number;
  // enqueueFn is a function that returns a list of job payloads to enqueue
  enqueueFn?: () => Promise<any[]>;
}) {
  const queue = createPriceCheckQueue(connection);

  const tick = async () => {
    try {
      const jobs = enqueueFn ? await enqueueFn() : [];
      for (const payload of jobs) {
        await queue.add(PRICE_CHECK_QUEUE + ':job', payload, { removeOnComplete: true, removeOnFail: false });
        console.log('Enqueued price check job', payload);
      }
    } catch (err) {
      console.error('Scheduler error', err);
    }
  };

  const id = setInterval(tick, intervalMs);
  return {
    stop: () => clearInterval(id),
  };
}

export default startWatchlistScheduler;
