# Setup prompt — paste this to your AI (with this repo open)

Copy everything below the line into your AI coding agent (Claude Code, Cursor, etc.) opened in
this folder. It sets the whole thing up with you and tests it before saying it's done. It
never needs anyone else's keys or designs — it asks you for yours and **generates your design
from your answers.**

---

You are setting up my AI proposal system end to end, in THIS folder. Go ONE step at a time.
Do not skip the checks. At the end, a real proposal must: open behind an email gate, get
signed, and take a Stripe payment — in MY brand.

**Step 1 — keys.** Open `GET_KEYS.md`. Walk me through getting each key one at a time: tell me
exactly where to click, wait for me to paste it, then write it into `.env` (copy `.env.example`
first). Keys: `VERCEL_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and optionally
`SLACK_BOT_TOKEN` + `SLACK_USER_ID`. Never print a real key back on screen.

**Step 2 — Supabase.** With my keys, create the `proposal_signatures` table (SQL is in
`STRUCTURE.md`) and a PRIVATE storage bucket named `proposal-signatures`. Confirm both exist.

**Step 3 — Stripe.** Ask me for my Stripe **payment link(s)**. Hold them for the design step.

**Step 4 — DESIGN IT WITH ME (generate it, don't copy anyone's).** Ask me ~4 quick questions:
(a) my brand name + one line on what I do, (b) a color or a vibe word, (c) dark / light / warm,
(d) who I'm selling to. Then **generate 2–3 distinct, genuinely different, beautiful proposal
designs from scratch** and show them to me. I pick one. Build the chosen design as a real HTML
proposal that follows `STRUCTURE.md`: the 5 parts in order (with a high anchor price tier),
the email gate wired to `/api/access`, the in-browser signing wired to `/api/sign`, and the
Stripe pay buttons that unlock only after signing. Use MY brand and MY words — not a template.

**Step 5 — deploy.** Set the env vars on Vercel, then deploy (`vercel --prod`). Give me the
live URL.

**Step 6 — test it for real (don't skip).**
1. Add my email to `_data/invites.js`. Open the link, type my email → it must open. Try a
   wrong email → it must stay locked.
2. Sign it → the PDF must download AND a row must land in Supabase (+ a Slack ping if I set it).
3. Click pay → Stripe checkout must open.

Do NOT tell me it's done until all four pass. Then tell me how to make a new proposal for the
next client.
