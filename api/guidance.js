import { OpenAI } from 'openai';

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured on the server.');
  }
  return new OpenAI({ apiKey });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topics, day } = req.body || {};

    const client = getClient();
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const topicList = Array.isArray(topics) && topics.length > 0
      ? topics.join(', ')
      : 'general Qur\'an understanding';

    const prompt = `You are generating 3 personalized questions for a user of a Qur'an app. The user is interested in: ${topicList}.

Generate exactly 3 thoughtful, specific questions about the Qur'an related to those topics. Each question should be something a Muslim would want to understand better.

Rules:
- Each question must be a single sentence, ending with a question mark.
- Do NOT use any markdown formatting. Plain text only.
- Do NOT number the questions. Put each question on its own line.
- Make questions specific and varied — don't repeat the same theme.
- Keep each question under 80 characters.
- Day seed: ${day || 1} (use this to vary the questions day by day)

Output exactly 3 lines, one question per line. Nothing else.`;

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    const questions = content
      .split('\n')
      .map((q) => q.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter((q) => q.length > 0)
      .slice(0, 3);

    return res.status(200).json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[guidance] error:', message);
    return res.status(500).json({ error: message });
  }
}
