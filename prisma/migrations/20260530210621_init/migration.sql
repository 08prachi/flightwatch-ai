/*
  Warnings:

  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `airline` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalTime` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `checkedAt` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `departureTime` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `flightNumber` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `stops` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `destinationAirport` on the `Watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `monitoringFrequency` on the `Watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `sourceAirport` on the `Watchlist` table. All the data in the column will be lost.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `Watchlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `Watchlist` table without a default value. This is not possible if the table is not empty.
  - Made the column `budget` on table `Watchlist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departureDate` on table `Watchlist` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_watchlistId_fkey";

-- DropForeignKey
ALTER TABLE "Watchlist" DROP CONSTRAINT "Watchlist_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isRead",
ADD COLUMN     "data" TEXT,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PriceHistory" DROP COLUMN "airline",
DROP COLUMN "arrivalTime",
DROP COLUMN "checkedAt",
DROP COLUMN "departureTime",
DROP COLUMN "flightNumber",
DROP COLUMN "stops",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "flightCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "highestPrice" DOUBLE PRECISION,
ADD COLUMN     "lowestPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Watchlist" DROP COLUMN "destinationAirport",
DROP COLUMN "isActive",
DROP COLUMN "monitoringFrequency",
DROP COLUMN "sourceAirport",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "airline" TEXT,
ADD COLUMN     "cabinClass" TEXT NOT NULL DEFAULT 'economy',
ADD COLUMN     "currentPrice" DOUBLE PRECISION,
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "lowestPrice" DOUBLE PRECISION,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "passengers" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "budget" SET NOT NULL,
ALTER COLUMN "flightType" SET DEFAULT 'any',
ALTER COLUMN "departureDate" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "PriceHistory_watchlistId_idx" ON "PriceHistory"("watchlistId");

-- CreateIndex
CREATE INDEX "PriceHistory_createdAt_idx" ON "PriceHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

-- CreateIndex
CREATE INDEX "Watchlist_active_idx" ON "Watchlist"("active");

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
