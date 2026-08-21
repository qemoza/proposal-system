// Email-gate check: is this email allowed to open this proposal?
// Allowed when the invite list has the email AND (slug = this proposal's slug OR slug = null = any proposal).
// Soft gate (content is still in the page source) — a real server-side access check + privacy, not hard security.
// Invite list is a statically-imported file (reliably bundled by Vercel; no database to set up).
import invites from '../_data/invites.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const { email = '', slug = '' } = req.body || {};
    const e = String(email).trim().toLowerCase();
    if (!e || e.indexOf('@') < 0) return res.status(400).json({ error: 'email' });
    const s = String(slug || '').toLowerCase();
    const allowed = (invites || []).some(i =>
      String(i.email).toLowerCase() === e && (i.slug == null || String(i.slug).toLowerCase() === s));
    return res.status(200).json({ allowed });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server' });
  }
}
