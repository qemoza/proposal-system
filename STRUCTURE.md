# Proposal anatomy + API contract

Your AI builds the proposal HTML in **your** brand. This is the spec it builds to — the
shape that closes, and the exact wiring to the backend in `api/`.

## The 5 parts (in this order — the order is the trick)

1. **Their problem** — restated in their words. Makes the whole thing feel custom.
2. **Why you + what they get** — your approach and deliverables. Outcomes, not features.
3. **Proof** — a real result, a logo, a short testimonial — placed right *before* the price.
4. **The price — AFTER the value.** Stack everything they get first. Include a high **anchor
   tier** no one is meant to buy — it makes your real price feel small.
5. **Legal** — one short paragraph of boilerplate, at the very end. Open a terms modal from a
   clickable "terms" link in the sign box.

## The email gate (opt-in)

- On load, show a full-screen overlay: "Enter your email to open this proposal."
- POST `{ email, slug }` to **`/api/access`**. `slug` = the proposal's URL slug, read from
  `location.pathname` (`/p/{slug}/`).
- Response `{ allowed: true }` → reveal the page. Else show "not on the list."
- Invites live in **`_data/invites.js`** (`{ email, slug }`; `slug: null` = any proposal).
  Add an email there to invite them; redeploy to publish the change.
- Gate is opt-in: a proposal with no invite for its slug is open to anyone with the link.

## The signing flow

- A sign panel: **name, email, title**, a **draw-signature** canvas, and an "I have read this
  proposal and agree to its **terms**" checkbox (terms open in a modal).
- On submit, build a **signed PDF in the browser** (jsPDF), trigger a download, AND POST to
  **`/api/sign`**:
  ```json
  { "pdfBase64": "...", "company": "", "client": "", "packageName": "", "price": "",
    "signerName": "", "signerTitle": "", "signerEmail": "", "signedAt": "", "pageUrl": "" }
  ```
- `/api/sign` stores the PDF in Supabase Storage (bucket **`proposal-signatures`**), inserts a
  row in table **`proposal_signatures`**, and Slack-pings you (if `SLACK_*` env set).
- **Sign first, then pay:** pay buttons start with class `paybtn locked`. After a successful
  sign, add class `signed` to `<body>` to unlock them.

## The payment

- Pay buttons are **Stripe Payment Links** (you create them, paste the URLs in). One per price.

## Supabase setup (your AI runs this SQL)

```sql
create table if not exists public.proposal_signatures (
  id bigint generated always as identity primary key,
  proposal_no text, company text, client text, package_name text, price text,
  signer_name text, signer_title text, signer_email text,
  signed_at timestamptz, page_url text, pdf_path text, pdf_url text,
  created_at timestamptz default now()
);
alter table public.proposal_signatures enable row level security;   -- only the service key writes
```
Then create a **private** Storage bucket named **`proposal-signatures`**.

## Env (Vercel project + local `.env`)

`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `PROPOSAL_DOMAIN`, and optional `SLACK_BOT_TOKEN` +
`SLACK_USER_ID`. The frontend only ever calls your own `/api/...` routes — no keys in the page.

## Where proposals live

Deploy serves each proposal at `/p/{slug}/index.html`. To make a new one, your AI writes a
new `p/{slug}/index.html` in your brand, fills the client's details, adds their email to
`_data/invites.js` (if gating), and redeploys.
