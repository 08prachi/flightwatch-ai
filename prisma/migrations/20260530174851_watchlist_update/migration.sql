-- AlterTable
ALTER TABLE "Watchlist" ADD COLUMN     "departureDate" TIMESTAMP(3),
ADD COLUMN     "monitoringFrequency" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "returnDate" TIMESTAMP(3);
