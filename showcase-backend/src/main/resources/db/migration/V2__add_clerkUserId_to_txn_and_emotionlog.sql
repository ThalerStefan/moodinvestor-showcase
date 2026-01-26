

-- 2) If you already have existing rows, set a placeholder user id.
-- If your tables are empty, you can remove these UPDATEs.
UPDATE txn SET clerkUserId = 'legacy' WHERE clerkUserId IS NULL;
UPDATE emotionlog SET clerkUserId = 'legacy' WHERE clerkUserId IS NULL;

-- 3) Enforce NOT NULL
ALTER TABLE txn MODIFY clerkUserId VARCHAR(64) NOT NULL;
ALTER TABLE emotionlog MODIFY clerkUserId VARCHAR(64) NOT NULL;

-- 4) Indexes
CREATE INDEX idx_txn_clerkUserId ON txn(clerkUserId);
CREATE INDEX idx_emotionlog_clerkUserId ON emotionlog(clerkUserId);
