-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MemePost" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "rules" TEXT NOT NULL DEFAULT 'Keep it funny, keep it original, and do not summon the group chat lawyers.';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MemeReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reporterKey" TEXT NOT NULL,
    "reason" VARCHAR(240) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemeReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatReport" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "reporterKey" TEXT NOT NULL,
    "reason" VARCHAR(240) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemeReport_status_createdAt_idx" ON "MemeReport"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MemeReport_postId_reporterKey_key" ON "MemeReport"("postId", "reporterKey");

-- CreateIndex
CREATE INDEX "ChatReport_status_createdAt_idx" ON "ChatReport"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatReport_messageId_reporterKey_key" ON "ChatReport"("messageId", "reporterKey");

-- AddForeignKey
ALTER TABLE "MemeReport" ADD CONSTRAINT "MemeReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "MemePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReport" ADD CONSTRAINT "ChatReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
