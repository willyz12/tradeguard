# Binance Agent OS - Natural-Language Trading Agent

Track A submission for the Binance Agent OS Mini Hackathon (deadline: September 8, 2026,
23:59 UTC).

## What this is
A natural-language trading agent: you type a plain-English trade request into a
Binance-MCP-connected client, the agent turns it into a structured order proposal, a local
guard service checks it against hard-coded spend/position limits, and only an approved
proposal is ever presented to Binance's own confirm-before-execute step. See
RESEARCH_BRIEF.md for why this project is scoped this way, and BUILD_ROADMAP.md for the full
session plan.

## Status
Session 2 of 4 complete (guardrail enforcement, tested - 18/18 checks pass). Session 3 (live
Agent OS integration) is partially blocked on real-world steps only a human can do - see
SESSION_REPORT.md's "Blocking on you" list. Demo script and this README section were drafted
early since they don't depend on those steps; see SESSION_REPORT.md for the exact, current
state of every file.

## Structure
- `skill/` - the system prompt / skill definition pasted into your MCP client
- `guard/` - a local service that will enforce spend/position limits and log every decision
- `docs/SETUP.md` - manual steps to connect to Agent OS and fund the sub-account
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
See `docs/DEMO_SCRIPT.md` for the shot list used to record the submission video.

## Safety model
This project follows a financial-safety ruleset (see AGENT_BUILD_RULESET.md, Section 9):
testnet-first validation where Agent OS allows it, hard limits enforced in code rather than
declared in a prompt, full decision logging, and no withdrawal capability at any point.
