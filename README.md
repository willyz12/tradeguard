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
Session 1 of 4 - core scaffold only. No trading logic exists yet; see SESSION_REPORT.md for
the exact current state.

## Structure
- `skill/` - the system prompt / skill definition pasted into your MCP client
- `guard/` - a local service that will enforce spend/position limits and log every decision
- `docs/SETUP.md` - manual steps to connect to Agent OS and fund the sub-account
- `.env.example` - required environment variables (no secrets committed)

## Setup
See `docs/SETUP.md`.

## Safety model
This project follows a financial-safety ruleset (see AGENT_BUILD_RULESET.md, Section 9):
testnet-first validation where Agent OS allows it, hard limits enforced in code rather than
declared in a prompt, full decision logging, and no withdrawal capability at any point.
