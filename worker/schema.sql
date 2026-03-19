-- schema.sql
-- Career Copilot D1 Database
-- Zero PII — only atomic counters and anonymous events
-- Run: npx wrangler d1 execute career-copilot-db --file=worker/schema.sql

-- Global counters table
-- One row per metric type, incremented atomically
CREATE TABLE IF NOT EXISTS counters (
  key   TEXT PRIMARY KEY,  -- 'resumes' | 'jd_matches' | 'interviews'
  value INTEGER NOT NULL DEFAULT 0
);

-- Seed initial counter rows
INSERT OR IGNORE INTO counters (key, value) VALUES ('resumes',    0);
INSERT OR IGNORE INTO counters (key, value) VALUES ('jd_matches', 0);
INSERT OR IGNORE INTO counters (key, value) VALUES ('interviews', 0);

-- Anonymous events log (for recent activity feed)
-- NO name, NO resume text, NO API key — only role + tool + model + timestamp
CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  tool       TEXT    NOT NULL,  -- 'resume' | 'jd' | 'interview'
  role       TEXT    NOT NULL,  -- 'PM' | 'SDE' | 'BA' etc — user selected, not PII
  model      TEXT    NOT NULL,  -- 'Groq' | 'Mistral Small' etc
  created_at INTEGER NOT NULL   -- Unix timestamp (ms)
);

-- Keep only last 100 events — older ones auto-cleaned by Worker
CREATE INDEX IF NOT EXISTS idx_events_created ON events (created_at DESC);
