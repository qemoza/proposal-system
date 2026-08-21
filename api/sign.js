export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const b = req.body || {};
    const { pdfBase64, company = '', proposalNo = '', client = '', packageName = '',
      price = '', signerName = '', signerTitle = '', signerEmail = '', signedAt = '', pageUrl = '' } = b;
    if (!pdfBase64 || !signerName) return res.status(400).json({ error: 'missing fields' });
    const SB = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY;
    const slug = (company || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client';
    const stamp = (signedAt || new Date().toISOString()).replace(/[:.]/g, '-');
    const path = `${slug}/${slug}-${proposalNo || 'na'}-${stamp}.pdf`;
    const pdfBuf = Buffer.from(pdfBase64, 'base64');

    const up = await fetch(`${SB}/storage/v1/object/proposal-signatures/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, 'Content-Type': 'application/pdf', 'x-upsert': 'true' },
      body: pdfBuf,
    });
    if (!up.ok) console.error('upload', up.status, await up.text());

    let pdfUrl = '';
    try {
      const su = await fetch(`${SB}/storage/v1/object/sign/proposal-signatures/${path}`, {
        method: 'POST', headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 30 }),
      });
      if (su.ok) { const j = await su.json(); pdfUrl = SB + '/storage/v1' + j.signedURL; }
    } catch (e) {}

    await fetch(`${SB}/rest/v1/proposal_signatures`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ proposal_no: proposalNo, company, client, package_name: packageName, price,
        signer_name: signerName, signer_title: signerTitle, signer_email: signerEmail,
        signed_at: signedAt || new Date().toISOString(), page_url: pageUrl, pdf_path: path, pdf_url: pdfUrl }),
    });

    try {
      if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_USER_ID) {
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: process.env.SLACK_USER_ID,
            text: `:writing_hand: *${company}* just signed *${packageName}* (${price}).\nBy ${signerName}${signerTitle ? ', ' + signerTitle : ''} · ${signerEmail}\n${pdfUrl || path}` }),
        });
      }
    } catch (e) {}

    return res.status(200).json({ ok: true, pdfPath: path, pdfUrl });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'server' }); }
}
