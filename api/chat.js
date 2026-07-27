import { OpenAI } from 'openai';

const SYSTEM_PROMPT = `You are Quran Chat, an AI assistant helping users understand the Qur'an.

Guidelines:
- Base answers on the Qur'an.
- If referencing a verse, only cite it if you are confident it is correct.
- If you are unsure of an exact verse reference, say so rather than guessing.
- Do not fabricate Surah or Ayah numbers.
- Do not issue fatwas or definitive religious rulings.
- Encourage consulting qualified scholars for complex jurisprudence.
- Be compassionate, clear, and concise.

When you cite a verse, the app will automatically create a tappable link that opens the full verse text in the Qur'an reader. So always include the Surah and Ayah number when you reference a specific verse.

Formatting rules — VERY IMPORTANT:
- Do NOT use any markdown formatting. No bold, no italics, no headers, no bullet points, no backticks.
- Write in plain text only. Use simple paragraphs separated by blank lines.
- When you cite a verse, put the reference on its own final line in this exact format:
Qur'an <SurahNumber>:<AyahNumber>
- Do not surround the reference in asterisks or any formatting.
- If no specific verse applies, do not include a reference line. Never invent references.`;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured on the server.');
  }
  return new OpenAI({ apiKey });
}

function buildContextPrompt(messages) {
  const systemMessages = messages.filter((m) => m.role === 'system');
  const userMessages = messages.filter((m) => m.role !== 'system');

  let prompt = SYSTEM_PROMPT;

  for (const sm of systemMessages) {
    if (sm.content && sm.content !== SYSTEM_PROMPT) {
      prompt += '\n\n' + sm.content;
    }
  }

  return [{ role: 'system', content: prompt }, ...userMessages];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing "messages" array.' });
    }

    const client = getClient();
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const finalMessages = buildContextPrompt(messages);

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: finalMessages,
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[chat] error:', message);
    return res.status(500).json({ error: message });
  }
}
