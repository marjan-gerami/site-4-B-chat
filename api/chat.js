const facts = [
  ['Vita A1', 4400000, true, true, 7],
  ['Vita B2', 3900000, true, false, 6],
  ['Vita C3', 5800000, true, true, 8],
  ['Vita D4', 4100000, true, true, 3],
  ['Vita E5', 4600000, true, false, 9],
  ['Vita F6', 4200000, true, true, 4]
];

const instruction = `تو دستیار فارسی فروشگاه ساعت هوشمند دیجی‌سلامت هستی. فقط درباره محصولات و اطلاعات قطعی زیر پاسخ بده. اطلاعات نامعلوم، تخفیف‌های غیرواقعی، موجودی فرضی، زمان ارسال و گارانتی را حدس نزن. اگر کاربر معیارهای خرید خود را بیان کرد، می‌توانی محصولات را بر اساس آن معیارها مقایسه کنی؛ هرگز به پژوهش، پایان‌نامه، گروه آزمایشی یا «پاسخ درست» اشاره نکن. پاسخ‌ها کوتاه، دقیق و محترمانه باشند. خرید و پرداخت واقعی وجود ندارد. اطلاعات محصولات (نام، قیمت تومان، ضربان قلب، اکسیژن خون، شارژدهی روز): ${JSON.stringify(facts)}.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'دستیار هنوز پیکربندی نشده است.' });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'پیام کاربر لازم است.' });
  }

  const contents = messages
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-8)
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'آخرین پیام باید از طرف کاربر باشد.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: instruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 250
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return res.status(502).json({ error: 'ارتباط با دستیار برقرار نشد.' });
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ reply: replyText || 'پاسخی دریافت نشد.' });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(504).json({ error: 'پاسخ دستیار بیش از حد طول کشید. دوباره تلاش کنید.' });
  } finally {
    clearTimeout(timeout);
  }
}
