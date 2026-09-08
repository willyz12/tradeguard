import type { DecisionLogEntry } from "./types.js";

/**
 * Session 1 stub. Session 2 implements real, append-only persistence
 * (flat file or SQLite - decide in Session 2, declare the choice in SESSION_REPORT.md).
 *
 * Per ruleset Section 9.5, every trade/payment/on-chain action must be logged with
 * timestamp, action, size, rationale, and which limit it was checked against - this
 * function is the single place that will happen once it's real. It intentionally
 * throws rather than silently no-op'ing, per Section 6 rule 3: a stub must never
 * pretend to be the real thing.
 */
export function appendDecisionLog(_entry: DecisionLogEntry): void {
  throw new Error(
    "appendDecisionLog is not implemented yet - this is a Session 1 stub. " +
      "See SESSION_REPORT.md 'Known stubs/mocks/TODOs'."
  );
}
