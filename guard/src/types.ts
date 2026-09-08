// Shared types for the guard-and-log service.
// Session 1: shape only. Session 2 implements the functions that use these types.

export type OrderSide = "BUY" | "SELL";

export interface OrderProposal {
  asset: string; // e.g. "BTCUSDT"
  side: OrderSide;
  quoteSizeUsdt: number; // proposed order size, in USDT terms
  orderType: "MARKET" | "LIMIT";
  limitPrice?: number; // required if orderType === "LIMIT"
  rationale: string; // one sentence: why this order, from the person's own request
}

export interface LimitConfig {
  maxOrderSizeUsdt: number;
  maxDailySpendUsdt: number;
  maxOpenPositionUsdt: number;
}

export interface GuardDecision {
  approved: boolean;
  reason: string; // human-readable, always populated (approval or denial reason)
  remainingDailyBudgetUsdt: number;
  checkedAgainst: keyof LimitConfig | "none";
}

export interface DecisionLogEntry {
  timestampIso: string;
  action: "PROPOSED" | "APPROVED" | "DENIED" | "EXECUTED";
  asset: string;
  side: OrderSide;
  quoteSizeUsdt: number;
  rationale: string;
  checkedAgainst: keyof LimitConfig | "none";
}
