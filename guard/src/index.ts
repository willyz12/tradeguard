/**
 * Local MCP server exposing one tool, `check_order`, that the skill
 * (skill/SYSTEM_PROMPT.md) is required to call before ever presenting an
 * order to Binance's own MCP trade tool.
 *
 * *** NOT YET VERIFIED ***
 * Written against the @modelcontextprotocol/sdk TypeScript API. This sandbox
 * has no network access, so the package could not actually be installed or
 * run here - only the dependency-free pieces (checkOrder.ts, limits.ts,
 * log.ts, all exercised by selfcheck.ts) have been genuinely tested this
 * session. Per ruleset Section 6 rule 9, treat this file as unconfirmed
 * until you've run `npm install`, then `npm run dev`, then connected a real
 * MCP client to it - do not trust it just because it reads correctly.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadLimitConfig } from "./limits.js";
import { checkOrder } from "./checkOrder.js";
import { appendDecisionLog, readTodaysEntries } from "./log.js";
import type { OrderProposal } from "./types.js";

const server = new McpServer({ name: "trading-guard", version: "0.1.0" });

server.tool(
  "check_order",
  "Checks a proposed Binance order against hard spend/position limits before " +
    "it is ever presented to Binance's own trade tool. Always call this " +
    "before proposing any order to the user.",
  {
    asset: z.string().describe('Trading pair, e.g. "BTCUSDT"'),
    side: z.enum(["BUY", "SELL"]),
    quoteSizeUsdt: z.number().positive(),
    orderType: z.enum(["MARKET", "LIMIT"]),
    limitPrice: z.number().positive().optional(),
    rationale: z.string(),
  },
  async (args) => {
    const proposal: OrderProposal = args;
    const limits = loadLimitConfig();
    const todaysEntries = readTodaysEntries();
    // currentOpenPositionUsdt is not wired up yet - see checkOrder.ts docstring
    // and SESSION_REPORT.md Known stubs. Session 3 wires this from Binance's
    // own account data via the Agent OS MCP connection.
    const decision = checkOrder(proposal, limits, todaysEntries);

    appendDecisionLog({
      timestampIso: new Date().toISOString(),
      action: decision.approved ? "APPROVED" : "DENIED",
      asset: proposal.asset,
      side: proposal.side,
      quoteSizeUsdt: proposal.quoteSizeUsdt,
      rationale: proposal.rationale,
      checkedAgainst: decision.checkedAgainst,
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(decision, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
