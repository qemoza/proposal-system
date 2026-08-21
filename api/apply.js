export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  try {
    const b = req.body || {};
    const { name = '', email = '', company = '', goals = '', proposalNo = '', pageUrl = '' } = b;
    if (!name || !email || !company) return res.status(400).json({ error: 'missing fields' });
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_USER_ID) {
      await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: process.env.SLACK_USER_ID,
          text: `:crown: *Founder Embedded application* from *${company}*\n${name} · ${email}\n_${goals || 'no note'}_\nProposal ${proposalNo} · ${pageUrl}`,
        }),
      });
    }
    return res.status(200).json({ ok: true });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'server' }); }
}
