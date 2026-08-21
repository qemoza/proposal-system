# AI Proposal System

A branded proposal that opens behind an email gate, gets signed in the browser, and takes
payment on Stripe — built and deployed with AI, on the cloud.

> **The flow:** share one private link → the client enters their email (checked against your
> list) → reads it → signs (a signed PDF is filed + you get a Slack ping) → the pay button
> unlocks → Stripe. No back and forth.

This repo gives you the **system** and a prompt that builds it with you. **You bring your own
keys and your own brand — your AI generates your design from your answers.** It is not a
template to copy; there are no designs in here.

## How to use it (with Claude Code, or any AI coding agent)

1. **Clone this repo** and open the folder in your AI coding tool.
2. Open **`GET_KEYS.md`** and grab your keys (Vercel, Supabase, Stripe — all free to start).
3. Paste **`SETUP_PROMPT.md`** to your AI. It will: collect your keys → set up Supabase +
   Stripe → **interview you about the look you want and generate your proposal design** →
   wire it to the backend → deploy to Vercel → test it.
4. Make proposals. To make another, ask your AI: "make a new proposal for {client}" — it
   copies your design into a new private link and swaps the details.

## What's in here

| File | What it is |
|---|---|
| `api/sign.js` | stores the signed PDF + a record in Supabase, and Slack-pings you |
| `api/access.js` | the email-gate check (is this email allowed to open this proposal?) |
| `api/apply.js` | optional "apply" ping for a by-application tier |
| `_data/invites.js` | your access list — `{ email, slug }` |
| `STRUCTURE.md` | the proposal anatomy + the exact API contract your AI builds to |
| `GET_KEYS.md` | where to click to get each key |
| `SETUP_PROMPT.md` | the one prompt that sets the whole thing up |
| `.env.example` | the keys you fill in |

Built by Hamza · qemoza.ai — watch the build video: (link in the description).
