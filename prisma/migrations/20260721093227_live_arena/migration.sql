-- CreateTable
CREATE TABLE "MemePost" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "imageData" TEXT NOT NULL,
    "caption" VARCHAR(280) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemeReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "visitorKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT '😂',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemeReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "voterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" VARCHAR(60) NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "visitorKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT '😂',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemePost_tournamentId_createdAt_idx" ON "MemePost"("tournamentId", "createdAt");

-- CreateIndex
CREATE INDEX "MemeReaction_postId_kind_idx" ON "MemeReaction"("postId", "kind");

-- CreateIndex
CREATE INDEX "PollVote_postId_idx" ON "PollVote"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_tournamentId_voterKey_key" ON "PollVote"("tournamentId", "voterKey");

-- CreateIndex
CREATE INDEX "ChatMessage_tournamentId_createdAt_idx" ON "ChatMessage"("tournamentId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatReaction_messageId_kind_idx" ON "ChatReaction"("messageId", "kind");

-- AddForeignKey
ALTER TABLE "MemePost" ADD CONSTRAINT "MemePost_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemePost" ADD CONSTRAINT "MemePost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemeReaction" ADD CONSTRAINT "MemeReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "MemePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "MemePost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReaction" ADD CONSTRAINT "ChatReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
