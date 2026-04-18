// api/chat.js — Vercel Serverless Function (NVIDIA NIM)
// API key lives ONLY here — never in frontend code

const WEDDING_DATA = {
  couple: { groom: "Nikhil", bride: "Prachi" },
  weddingDate: "10 May 2026",
  events: [
    { name: "Mehndi Ceremony",   date: "8 May 2026",  time: "4:00 PM onwards", venue: "Mata Amritanandamayi Math, Nigdi, Pune", dress: "Yellow / Green Traditional" },
    { name: "Sangeet Night",     date: "9 May 2026",  time: "7:00 PM onwards", venue: "Mata Amritanandamayi Math, Nigdi, Pune", dress: "Cocktail / Festive Colourful" },
    { name: "Wedding Ceremony",  date: "10 May 2026", time: "11:00 AM",        venue: "Mata Amritanandamayi Math, Nigdi, Pune", dress: "Traditional / Formal" },
    { name: "Wedding Reception", date: "10 May 2026", time: "7:00 PM onwards", venue: "Mata Amritanandamayi Math, Nigdi, Pune", dress: "Ethnic / Formal Elegant" }
  ],
  venue: { name: "Mata Amritanandamayi Math", address: "Mata Amritanandamayi Math, Nigdi, Pune – 411044, Maharashtra" },
  story: "Nikhil and Prachi began their journey in 2021. Nikhil proposed in 2023 and Prachi said yes. They are getting married on 10 May 2026.",
  rsvp: "Guests can confirm attendance by filling the RSVP form on this website."
};

const SYSTEM_PROMPT = `You are a warm and friendly wedding assistant for Nikhil and Prachi's wedding celebration.

WEDDING DETAILS:
- Couple: ${WEDDING_DATA.couple.groom} & ${WEDDING_DATA.couple.bride}
- Wedding Date: ${WEDDING_DATA.weddingDate}
- Venue: ${WEDDING_DATA.venue.name}, ${WEDDING_DATA.venue.address}

EVENTS:
${WEDDING_DATA.events.map(e => `• ${e.name}: ${e.date} at ${e.time} | ${e.venue} | Dress: ${e.dress}`).join('\n')}

STORY: ${WEDDING_DATA.story}
RSVP: ${WEDDING_DATA.rsvp}

INSTRUCTIONS:
- Answer warmly, briefly and helpfully
- Use emojis occasionally
- If asked something unrelated to the wedding, politely redirect
- Keep responses under 3 sentences
- Always be positive and celebratory`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'No message provided' });
  }

  // Try NVIDIA NIM first, fallback to Groq
  const nvidiaKey = process.env.NVIDIA_NIM_API_KEY;
  const groqKey   = process.env.GROQ_API_KEY;

  if (!nvidiaKey && !groqKey) {
    return res.status(200).json({ reply: getLocalReply(message) });
  }

  try {
    let reply;

    if (nvidiaKey) {
      // NVIDIA NIM API
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-8b-instruct',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: message }
          ],
          max_tokens: 200,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) throw new Error(`NVIDIA API ${response.status}`);
      const data = await response.json();
      reply = data.choices[0].message.content;

    } else {
      // Groq fallback
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: message }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error(`Groq API ${response.status}`);
      const data = await response.json();
      reply = data.choices[0].message.content;
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Chat API error:', err.message);
    // Always return something — never crash
    return res.status(200).json({ reply: getLocalReply(message) });
  }
}

// Local fallback — works even without any API key
function getLocalReply(msg) {
  const q = msg.toLowerCase();
  if (q.match(/event|program|schedule|timing/))
    return '🎉 Events: Mehndi (8 May, 4PM) · Sangeet (9 May, 7PM) · Wedding (10 May, 11AM) · Reception (10 May, 7PM) — all at Mata Amritanandamayi Math, Nigdi, Pune!';
  if (q.match(/venue|location|where|address|sweta|nigdi|pune/))
    return '📍 Mata Amritanandamayi Math, Nigdi, Pune – 411044, Maharashtra.';
  if (q.match(/dress|wear|attire|code/))
    return '👗 Mehndi: Yellow/Green · Sangeet: Cocktail/Festive · Wedding: Traditional/Formal · Reception: Ethnic/Formal';
  if (q.match(/rsvp|confirm|attend|register/))
    return '✉ Please scroll to the RSVP section and fill in the form to confirm your attendance!';
  if (q.match(/date|when|may|2026/))
    return '💍 The wedding is on 10 May 2026! Mehndi: 8 May · Sangeet: 9 May · Reception: 10 May evening.';
  if (q.match(/nikhil|prachi|couple|story|proposal/))
    return '❤️ Nikhil & Prachi began their journey in 2021, Nikhil proposed in 2023, and they\'re getting married on 10 May 2026!';
  if (q.match(/hi|hello|hey|namaste/))
    return 'Namaste! 🙏 Welcome to Nikhil & Prachi\'s wedding! I\'m here to help. Ask me about events, venue, dress code or RSVP!';
  return 'I can help with events, venue, dress code, RSVP and more about Nikhil & Prachi\'s wedding! 🌹 What would you like to know?';
}
