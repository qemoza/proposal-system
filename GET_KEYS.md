# Step 1 — Get your keys (do this first)

Before anything runs, you need a few keys. This is the only "boring" part. Go one by one.
Paste each into a file called `.env` (copy `.env.example` to `.env` first).

> **Pick your path first.** It changes what you need:
> - **Full system** (proposal + email gate + in-browser signing + Stripe) → needs a host that runs code: **Vercel** (easiest), Netlify, or Cloudflare. Get the Vercel + Supabase keys below.
> - **Lite / static** (a beautiful proposal + a Stripe "Pay" button, no gate, no e-sign) → can live on **GitHub Pages**. You only need the Stripe link + a GitHub token. Skip Supabase.

---

## 1. Vercel — hosting + the API  (full system)
1. Go to **vercel.com** → sign up (use your GitHub login, it's easiest).
2. Click your avatar → **Account Settings** → **Tokens**.
3. **Create Token** → name it "proposals" → **Create** → copy it.
4. Put it in `.env`: `VERCEL_TOKEN=...`

## 2. Supabase — stores the signed PDFs + signer records  (full system)
1. Go to **supabase.com** → **New project** (free). Pick a name + a database password.
2. Wait ~2 min for it to spin up.
3. **Settings → API**: copy the **Project URL** and the **`service_role`** key (the secret one).
   - `.env`: `SUPABASE_URL=...` and `SUPABASE_SERVICE_KEY=...`
4. **SQL Editor** → paste the SQL from `STRUCTURE.md` (the `proposal_signatures` table) → **Run**.
5. **Storage** → **New bucket** → name it `proposal-signatures` → keep it **Private**.

## 3. Stripe — takes the money  (both paths)
1. Go to **stripe.com** → sign up → finish "Activate" so you can take real payments.
2. **Products** → **Add product** → set the price → **Save**.
3. On the product, **Create payment link** → copy the link (looks like `buy.stripe.com/...`).
4. Make one link per price you sell. Paste them into your proposal's pay buttons.
   - (You don't need Stripe API keys for this — just the payment links.)

## 4. GitHub — only for the lite/static path (GitHub Pages)
1. **github.com** → make a new repo (public is fine).
2. Push the proposal HTML to it.
3. Repo **Settings → Pages** → Source: your branch → Save. Your proposal goes live at `username.github.io/repo`.
4. Token (if you want a script to push for you): **Settings → Developer settings → Personal access tokens → Fine-grained** → repo access → copy. `.env`: `GITHUB_TOKEN=...`
   - ⚠️ GitHub Pages is **static only** — the email gate, in-browser signing, and Slack ping will **not** run here. Use it for "pretty proposal + a Stripe pay button." For the full system use Vercel.

## 5. Slack — optional, pings you when someone signs  (full system)
1. **api.slack.com/apps** → **Create New App** → From scratch.
2. **OAuth & Permissions** → add bot scope `chat:write` → **Install to workspace** → copy the **Bot token** (`xoxb-...`).
   - `.env`: `SLACK_BOT_TOKEN=...`
3. Your member ID: in Slack, click your name → **Copy member ID**. `.env`: `YOUR_SLACK_ID=...`

---

### When you're done, your `.env` looks like:
```
VERCEL_TOKEN=...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=...
SLACK_BOT_TOKEN=xoxb-...      # optional
YOUR_SLACK_ID=U...            # optional
# lite/static path instead:
GITHUB_TOKEN=...              # only if using GitHub Pages
```
Next: open `SETUP_PROMPT.md`, copy the whole thing, and paste it to Claude. It does the rest.
