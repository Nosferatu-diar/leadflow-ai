BEGIN;

CREATE TYPE "AIPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

ALTER TABLE "Lead"
  ADD COLUMN "aiSummary" TEXT,
  ADD COLUMN "aiPriority" "AIPriority",
  ADD COLUMN "aiIntent" TEXT,
  ADD COLUMN "aiSuggestedReply" TEXT,
  ADD COLUMN "aiAnalyzedAt" TIMESTAMPTZ(3);

COMMIT;
