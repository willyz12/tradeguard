import type { LimitConfig } from "./types.js";

const REQUIRED_VARS = [
  "MAX_ORDER_SIZE_USDT",
  "MAX_DAILY_SPEND_USDT",
  "MAX_OPEN_POSITION_USDT",
] as const;

/**
 * Loads limit config from environment variables. Throws immediately if any
 * required var is missing or not a valid positive number - per ruleset
 * Section 6 rule 3, a missing resource is a stop, not a silently-assumed
 * default, and per Section 9.4 these limits must exist as real, enforced
 * code rather than a config value nothing reads.
 */
export function loadLimitConfig(
  env: Record<string, string | undefined> = process.env
): LimitConfig {
  const values: Record<string, number> = {};
  for (const name of REQUIRED_VARS) {
    const raw = env[name];
    if (raw === undefined || raw.trim() === "") {
      throw new Error(
        `Missing required env var ${name}. Set it in .env before running the guard service - ` +
          "see docs/SETUP.md step 3. This is not defaulted, per Section 9.4."
      );
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num <= 0) {
      throw new Error(`Env var ${name} must be a positive number, got: ${raw}`);
    }
    values[name] = num;
  }
  return {
    maxOrderSizeUsdt: values.MAX_ORDER_SIZE_USDT,
    maxDailySpendUsdt: values.MAX_DAILY_SPEND_USDT,
    maxOpenPositionUsdt: values.MAX_OPEN_POSITION_USDT,
  };
}
