# Setup - Connecting to Binance Agent OS

These steps are manual and human-only - no build session can automate them
(per AGENT_BUILD_RULESET.md, Section 2).

## 1. Connect your client to the Agent OS MCP server
In a Binance-MCP-capable client (Claude Desktop, Claude Code, ChatGPT, VS Code, or similar),
add a custom MCP connector pointing at:

    https://agent.binance.com/mcp/agentic

Your client will walk you through a browser-based consent flow on binance.com. This grants
the agent read access to market data and your Agentic sub-account, plus the ability to
*propose* trades and transfers within that sub-account - never withdrawals.

*Exact menu wording varies by client version - follow your client's own "add custom
connector / MCP server" flow if it differs from what you expected. Check Binance's current
Agent Native docs if the connector fails to add.*

## 2. Create and fund the Agentic sub-account
Binance creates a dedicated sub-account for the agent the first time you connect. You must
fund it yourself, manually, from your main account - the agent cannot pull funds in. Fund it
with an amount you are fully comfortable trading away entirely; per Section 9.3, withdrawal
permission stays off, but market movement and the trades this agent places are real.

## 3. Set your limits before any live session
Decide MAX_ORDER_SIZE_USDT, MAX_DAILY_SPEND_USDT, and MAX_OPEN_POSITION_USDT (see
.env.example) before Session 3. These numbers, not the size of the sub-account, are what the
guard service enforces in code once Session 2 builds it.

## 4. Testnet validation (Session 3)
Separately from Agent OS, get API keys from Binance's public Spot/Futures testnet
(https://testnet.binance.vision) to validate the order-parsing logic without touching Agent
OS or real funds at all. This is unrelated to the Agentic sub-account above - Agent OS itself
has no testnet mode (see RESEARCH_BRIEF.md).
