-- Add local tournament winner tracking.
ALTER TABLE "Tournament" ADD COLUMN "winnerPostId" TEXT;

-- Prevent one visitor from repeatedly adding the same reaction.
CREATE UNIQUE INDEX "ChatReaction_messageId_visitorKey_kind_key" ON "ChatReaction"("messageId", "visitorKey", "kind");
CREATE UNIQUE INDEX "MemeReaction_postId_visitorKey_kind_key" ON "MemeReaction"("postId", "visitorKey", "kind");
