/**
 * Pure-logic smoke test for the guard's core enforcement function.
 * Exercises checkOrder() directly with synthetic data - no file I/O, no
 * network, no MCP SDK - so it runs anywhere `tsx` runs, including fully
 * offline. This is the cheap, constant verification from Section 6 rule 8;
 * it is not a substitute for actually running the MCP server end-to-end
 * (see SESSION_REPORT.md's unverified-dependency note for that).
 *
 * Run: npx tsx guard/src/selfcheck.ts
 */
import { checkOrder } from "./checkOrder.js";
import { loadLimitConfig } from "./limits.js";
import type { LimitConfig, DecisionLogEntry, OrderProposal } from "./types.js";

const limits: LimitConfig = {
  maxOrderSizeUsdt: 50,
  maxDailySpendUsdt: 100,
  maxOpenPositionUsdt: 200,
};

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`ok - ${message}`);
  }
}

const order = (quoteSizeUsdt: number): OrderProposal => ({
  asset: "BTCUSDT",
  side: "BUY",
  quoteSizeUsdt,
  orderType: "MARKET",
  rationale: "selfcheck",
});

// 1. Order within both limits, no prior spend today -> approved
const d1 = checkOrder(order(30), limits, []);
assert(d1.approved === true, "30 USDT order approved with no prior spend");
assert(d1.remainingDailyBudgetUsdt === 70, "remaining budget correctly reduced to 70");

// 2. Order exceeding per-order limit -> denied, regardless of daily budget
const d2 = checkOrder(order(60), limits, []);
assert(d2.approved === false, "60 USDT order denied - exceeds per-order limit of 50");
assert(d2.checkedAgainst === "maxOrderSizeUsdt", "denial correctly attributed to per-order limit");

// 3. Order within per-order limit but daily budget already mostly spent -> denied
const priorSpend: DecisionLogEntry[] = [
  {
    timestampIso: new Date().toISOString(),
    action: "APPROVED",
    asset: "ETHUSDT",
    side: "BUY",
    quoteSizeUsdt: 80,
    rationale: "prior order",
    checkedAgainst: "maxDailySpendUsdt",
  },
];
const d3 = checkOrder(order(30), limits, priorSpend);
assert(d3.approved === false, "30 USDT order denied - only 20 USDT left of daily budget");
assert(d3.checkedAgainst === "maxDailySpendUsdt", "denial correctly attributed to daily limit");

// 4. Zero/negative size is always rejected before any limit check
const d4 = checkOrder(order(0), limits, []);
assert(d4.approved === false, "zero-size order rejected outright");

// 5. Position limit correctly enforced once a current position is supplied
const d5 = checkOrder(order(30), limits, [], 190);
assert(d5.approved === false, "30 USDT BUY denied - would push position from 190 to 220, over 200 limit");
assert(d5.checkedAgainst === "maxOpenPositionUsdt", "denial correctly attributed to position limit");

// 6. Same order approved when position limit isn't supplied - but says so explicitly, never silently
const d6 = checkOrder(order(30), limits, []);
assert(d6.approved === true, "same order approved when no position context given");
assert(
  d6.reason.includes("NOT checked"),
  "approval reason explicitly flags that position limit wasn't checked"
);

// 7. loadLimitConfig: fails loudly on a missing var rather than defaulting
try {
  loadLimitConfig({ MAX_ORDER_SIZE_USDT: "50", MAX_DAILY_SPEND_USDT: "100" });
  assert(false, "loadLimitConfig should have thrown on missing MAX_OPEN_POSITION_USDT");
} catch (err) {
  assert(
    err instanceof Error && err.message.includes("MAX_OPEN_POSITION_USDT"),
    "loadLimitConfig throws naming the exact missing var"
  );
}

// 8. loadLimitConfig: fails loudly on a non-numeric value rather than coercing
try {
  loadLimitConfig({
    MAX_ORDER_SIZE_USDT: "fifty",
    MAX_DAILY_SPEND_USDT: "100",
    MAX_OPEN_POSITION_USDT: "200",
  });
  assert(false, "loadLimitConfig should have thrown on a non-numeric value");
} catch (err) {
  assert(err instanceof Error, "loadLimitConfig throws on a non-numeric value");
}

// 9. loadLimitConfig: succeeds and parses correctly when all vars are valid
const cfg = loadLimitConfig({
  MAX_ORDER_SIZE_USDT: "50",
  MAX_DAILY_SPEND_USDT: "100",
  MAX_OPEN_POSITION_USDT: "200",
});
assert(cfg.maxOrderSizeUsdt === 50 && cfg.maxDailySpendUsdt === 100 && cfg.maxOpenPositionUsdt === 200, "loadLimitConfig parses valid env into the right numbers");

console.log(process.exitCode === 1 ? "\nSELFCHECK FAILED" : "\nSELFCHECK PASSED");
