import { appendFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DecisionLogEntry } from "./types.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = join(HERE, "..", "decisions.log.jsonl");

/**
 * Append-only JSONL decision log, per Section 9.5. Every line is one
 * DecisionLogEntry. Never overwritten, never rewritten - only appended.
 */
export function appendDecisionLog(entry: DecisionLogEntry): void {
  const dir = dirname(LOG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n", "utf8");
}

/** Reads every entry logged so far today (UTC calendar day), oldest first. */
export function readTodaysEntries(): DecisionLogEntry[] {
  if (!existsSync(LOG_PATH)) return [];
  const todayUtc = new Date().toISOString().slice(0, 10);
  return readFileSync(LOG_PATH, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as DecisionLogEntry)
    .filter((e) => e.timestampIso.slice(0, 10) === todayUtc);
}
