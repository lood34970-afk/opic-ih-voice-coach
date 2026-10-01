export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const question = String(body.question || '').trim().slice(0, 1800);
    const answer = String(body.answer || '').trim().slice(0, 6000);
    const topic = String(body.topic || '').trim().slice(0, 240);
    const targetSeconds = Math.max(60, Math.min(120, Number(body.targetSeconds) || 100));

    if (!question || !answer) {
      return res.status(400).json({ error: 'question and answer are required.' });
    }

    const model = normalizeModel(process.env.OPENAI_MODEL_ANSWER_MODEL || process.env.OPENAI_FEEDBACK_MODEL);
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 900,
        instructions: [
          'You are an expert OPIc speaking coach for a Korean learner aiming for IH.',
          'Rewrite the learner transcript into one natural IH-level spoken answer to the exact question.',
          'Preserve the learner’s actual facts, people, places, preferences, opinions, and core meaning.',
          'Correct grammar and awkward wording, add natural transitions, and organize the answer clearly.',
          'Do not invent a new event, person, place, preference, or outcome that the learner did not mention.',
          'If the transcript lacks detail, stay general instead of fabricating specifics.',
          'Return only the improved English answer with no title, label, bullet points, quotation marks, or coaching notes.'
        ].join(' '),
        input: [
          `Topic: ${topic || 'unknown'}`,
          `Exact question: ${question}`,
          `Target speaking time: about ${targetSeconds} seconds`,
          `Learner transcript: ${answer}`,
          '',
          'Create a cohesive answer of about 100-150 words. Keep it recognizably based on the learner transcript.'
        ].join('\n')
      })
    });

    const responseText = await upstream.text();
    let data;
    try { data = JSON.parse(responseText); } catch { data = { raw: responseText }; }

    if (!upstream.ok) {
      return res.status(upstream.status || 500).json({
        error: cleanOpenAIError(data?.error?.message) || 'OpenAI model answer generation failed.',
        model
      });
    }

    const modelAnswer = normalizeModelAnswer(extractResponseText(data));
    if (!modelAnswer) {
      return res.status(502).json({ error: 'OpenAI returned an empty model answer.', model });
    }

    return res.status(200).json({ modelAnswer, model, basedOnWords: answer.split(/\s+/).filter(Boolean).length });
  } catch (error) {
    return res.status(500).json({ error: cleanOpenAIError(error?.message) || 'Model answer server error.' });
  }
}

function extractResponseText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const parts = [];
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      if (typeof content?.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

function normalizeModelAnswer(value) {
  return String(value || '')
    .replace(/^(model answer|sample answer|improved answer)\s*:\s*/i, '')
    .replace(/^['"]|['"]$/g, '')
    .trim()
    .slice(0, 3600);
}

function normalizeModel(value) {
  const model = String(value || '').trim();
  if (/^sk-/.test(model)) return 'gpt-4o-mini';
  return model || 'gpt-4o-mini';
}

function cleanOpenAIError(message) {
  return String(message || '')
    .replace(/sk-[A-Za-z0-9_-]+/g, 'sk-...')
    .replace(/'sk-[^']+'/g, "'sk-...'");
}
