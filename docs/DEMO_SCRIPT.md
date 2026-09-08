# Demo Video - Shot List

For Track A's submission (video demo + GitHub repo). Draft only - the actual recording needs
Session 3 finished (funded sub-account, live Agent OS connection, npm install verified). This
shot list can be reviewed and adjusted now so recording is fast once that's unblocked.

Target length: 2-3 minutes. Judges are scanning many submissions - lead with the hook, not a
slow intro.

## 1. Hook (0:00-0:15)
Screen: a chat window with the skill connected.
Say: "This is a Binance Agent OS trading agent you talk to in plain English - but every order
it proposes has to pass a hard-coded limit check before it ever reaches Binance's own
confirmation step. The limits aren't a prompt. They're code."

## 2. The happy path (0:15-0:45)
Type: "Buy $10 of BTC."
Show: the agent calling `check_order` (visible tool-call in the client), the guard's JSON
response (`approved: true`), the agent restating the order in plain language, Binance's own
MCP confirmation prompt, and the confirmed result.
Say (over the top, brief): "It parses the request, checks it against my limits locally, then
Binance's own confirm-before-execute step is still the final gate before anything real
happens."

## 3. The refusal path - the actual point of the project (0:45-1:30)
Type: "Buy $500 of BTC."
Show: `check_order` returning `approved: false` with the specific reason (exceeds the $10
per-order limit). The agent explains why and stops - critically, show that it does NOT fall
back to Binance's trade tool at all.
Say: "This is the part that matters: the model never gets a chance to place this order. The
guard is a separate piece of code the agent can't argue its way around, and it's the one
generating this refusal, not the model deciding to be cautious."

## 4. Show the decision log (1:30-1:50)
Screen: `guard/decisions.log.jsonl`, scrolled to the two entries from this session.
Say: "Every proposal - approved or denied - is logged with a timestamp and which limit it was
checked against, so nothing about what almost happened is invisible after the fact."

## 5. Architecture in one breath (1:50-2:15)
Screen: README.md's structure section, or a simple whiteboard-style diagram if time allows.
Say: "Three pieces: the skill that talks to you, a local guard that enforces limits in code,
and Binance's own Agent OS MCP server, which never exposes withdrawal and always asks you to
confirm before anything executes."

## 6. Close (2:15-2:30)
Say: "Built for the Agent OS Mini Hackathon, Track A. Repo link is in the description."

## Notes for whoever records this
- Use the real, funded Agentic sub-account with the real $10/$30/$50 limits - don't fake the
  numbers on screen, since judges may check the repo against what's shown.
- The refusal shot (section 3) is the actual differentiator against "it places orders"
  submissions - don't rush it.
- If something breaks live, cut and redo that segment rather than narrating around a failure -
  a hackathon demo video should show the thing working, not a debugging session.
