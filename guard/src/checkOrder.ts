import type {
  OrderProposal,
  LimitConfig,
  GuardDecision,
  DecisionLogEntry,
} from "./types.js";

/**
 * The actual enforcement logic (Section 9.4): the only function that
 * produces a GuardDecision, so the skill can be instructed to treat "not
 * approved by this function" as "do not present this order to Binance's
 * trade tool." Pure function - no file or network I/O - so it can be
 * smoke-tested directly (see selfcheck.ts) without needing anything
 * installed beyond Node itself.
 *
 * currentOpenPositionUsdt is optional and NOT YET WIRED end-to-end: it needs
 * to come from Binance's own account/position data via the MCP connection,
 * which this local guard doesn't read yet (Session 3 work). Until a caller
 * supplies it, position-limit enforcement is skipped and the decision says
 * so explicitly in its reason - it is never silently assumed to be fine.
 */
export function checkOrder(
  proposal: OrderProposal,
  limits: LimitConfig,
  todaysEntries: DecisionLogEntry[],
  currentOpenPositionUsdt?: number
): GuardDecision {
  if (proposal.quoteSizeUsdt <= 0) {
    return {
      approved: false,
      reason: "Order size must be a positive USDT amount.",
      remainingDailyBudgetUsdt: remainingDailyBudget(limits, todaysEntries),
      checkedAgainst: "none",
    };
  }

  if (proposal.quoteSizeUsdt > limits.maxOrderSizeUsdt) {
    return {
      approved: false,
      reason: `Order size ${proposal.quoteSizeUsdt} USDT exceeds the per-order limit of ${limits.maxOrderSizeUsdt} USDT.`,
      remainingDailyBudgetUsdt: remainingDailyBudget(limits, todaysEntries),
      checkedAgainst: "maxOrderSizeUsdt",
    };
  }

  const remaining = remainingDailyBudget(limits, todaysEntries);
  if (proposal.quoteSizeUsdt > remaining) {
    return {
      approved: false,
      reason: `Order size ${proposal.quoteSizeUsdt} USDT would exceed today's remaining budget of ${remaining} USDT (daily limit ${limits.maxDailySpendUsdt} USDT).`,
      remainingDailyBudgetUsdt: remaining,
      checkedAgainst: "maxDailySpendUsdt",
    };
  }

  if (currentOpenPositionUsdt !== undefined) {
    const delta = proposal.side === "BUY" ? proposal.quoteSizeUsdt : -proposal.quoteSizeUsdt;
    const projected = currentOpenPositionUsdt + delta;
    if (projected > limits.maxOpenPositionUsdt) {
      return {
        approved: false,
        reason: `Projected position ${projected} USDT would exceed the position limit of ${limits.maxOpenPositionUsdt} USDT.`,
        remainingDailyBudgetUsdt: remaining,
        checkedAgainst: "maxOpenPositionUsdt",
      };
    }
  }

  return {
    approved: true,
    reason:
      currentOpenPositionUsdt === undefined
        ? "Within per-order and daily limits. Position limit NOT checked - current position wasn't supplied yet (see SESSION_REPORT.md Known stubs)."
        : "Within per-order, daily, and position limits.",
    remainingDailyBudgetUsdt: remaining - proposal.quoteSizeUsdt,
    checkedAgainst: "maxDailySpendUsdt",
  };
}

function remainingDailyBudget(limits: LimitConfig, entries: DecisionLogEntry[]): number {
  const spentToday = entries
    .filter((e) => e.action === "APPROVED" || e.action === "EXECUTED")
    .reduce((sum, e) => sum + e.quoteSizeUsdt, 0);
  return Math.max(0, limits.maxDailySpendUsdt - spentToday);
}
