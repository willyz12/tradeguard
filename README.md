# Binance Agent OS - Natural-Language Trading Agent

Track A submission for the Binance Agent OS Mini Hackathon 

## What this is
A natural-language trading agent: you type a plain-English trade request into a
Binance-MCP-connected client, the agent turns it into a structured order proposal, a local
guard service checks it against hard-coded spend/position limits, and only an approved
proposal is ever presented to Binance's own confirm-before-execute step. See
RESEARCH_BRIEF.md for why this project is scoped this way, and BUILD_ROADMAP.md for the full
session plan.

## Status
Code complete and pushed to GitHub. **Demo video is the only thing left before submission.**

Before recording, run the pre-recording dry run if you haven't already: start the guard
server (`npm run dev`), confirm both MCP connectors show in your client, run one real small
trade end-to-end, check `guard/decisions.log.jsonl` for the entry, then try one order over
the limit and confirm it's refused. See `docs/DEMO_SCRIPT.md` for the full recording shot
list. See `SESSION_REPORT.md` for the exact, current state of every file, including what's
been genuinely tested versus what's written-but-unverified.

## Structure
- `skill/` - the system prompt / skill definition pasted into your MCP client
- `guard/` - a local service that enforces spend/position limits and logs every decision
- `docs/SETUP.md` - manual steps to connect to Agent OS and fund the sub-account
- `docs/DEMO_SCRIPT.md` - shot list for the submission video
- `.env.example` - required environment variables (no secrets committed)

## Setup
See `docs/SETUP.md`.

## How it works
1. You type a plain-English trade request into a Binance-MCP-connected client that has both
   Binance's own Agent OS MCP server and this project's local `trading-guard` MCP server
   connected (`skill/SYSTEM_PROMPT.md` is the instructions pasted into that client).
2. The skill turns your request into a structured order proposal and calls the local
   `check_order` tool - it cannot skip this step; the system prompt requires it, and the tool
   is the only source of an approval.
3. `check_order` (`guard/src/checkOrder.ts`) checks the proposal against hard, code-enforced
   limits - per-order size, daily cumulative spend, and open position - loaded from your own
   `.env`, never hardcoded and never defaulted silently if missing.
4. Every check, approved or denied, is appended to an audit trail
   (`guard/decisions.log.jsonl`) with a timestamp and exactly which limit it was checked
   against.
5. Only an approved proposal is ever presented to Binance's own MCP trade tool, which then
   runs its own confirm-before-execute step before anything real happens. Binance's MCP server
   never exposes a withdrawal capability at all - funds can only move within the isolated,
   manually-funded Agentic sub-account.

## Demo
See `docs/DEMO_SCRIPT.md` for the shot list used to record the submission video. The refusal
shot - asking for an order over the limit and showing it get rejected before Binance's own
trade tool ever sees it - is the project's actual differentiator; don't cut it short.

## Safety model
This project follows a financial-safety ruleset (see AGENT_BUILD_RULESET.md, Section 9):
testnet-first validation where Agent OS allows it, hard limits enforced in code rather than
declared in a prompt, full decision logging, and no withdrawal capability at any point.

## What's verified vs. not
- **Tested and passing:** the guardrail enforcement logic (`checkOrder.ts`, `limits.ts`) -
  18/18 checks, including the exact chosen limits ($10/order, $30/day, $50 max position). The
  decision log's append/read round-trip. The signing function used for testnet validation.
- **Written but not yet independently confirmed by this project's own build process:** the
  local MCP server (`guard/src/index.ts`) and its dependency on `@modelcontextprotocol/sdk`.
  Run the pre-recording dry run above to confirm it for real before relying on it in the demo.
