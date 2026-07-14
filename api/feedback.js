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
    const question = String(body.question || '').trim();
    const answer = String(body.answer || '').trim();
    const topic = String(body.topic || '').trim();
    const targetSeconds = Number(body.targetSeconds || 100);
    const answerSeconds = Number(body.answerSeconds || 0);

    if (!question || !answer) {
      return res.status(400).json({ error: 'question and answer are required.' });
    }

    const model = normalizeFeedbackModel(process.env.OPENAI_FEEDBACK_MODEL);
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        max_tokens: 1100,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              'You are an expert OPIc speaking coach for a Korean learner aiming for IH.',
              'Evaluate whether the answer directly answers the question.',
              'Give practical feedback, concise but detailed.',
              'Focus on OPIc IH: relevance, structure, detail, grammar, and natural correction of the learner’s own sentences.',
              'Do not provide a full model answer. Instead, correct the learner’s actual wording with before/after examples.',
              'Return only valid JSON with key items. items must be an array of 8-10 strings.',
              'The first half must be English feedback only. The second half must be Korean translations of the same feedback in the same order.',
              'For every correction, the recommended expression after the arrow must remain in English, even inside the Korean translation.'
            ].join(' ')
          },
          {
            role: 'user',
            content: [
              `Topic: ${topic || 'unknown'}`,
              `Question: ${question}`,
              `Target seconds: ${targetSeconds}`,
              `Actual seconds: ${answerSeconds || 'unknown'}`,
              `Transcript: ${answer}`,
              '',
              'Feedback requirements:',
              '1. First item: overall IH readiness in one sentence.',
              '2. Check relevance to the exact question.',
              '3. Mention 2-4 concrete grammar or wording corrections from the transcript.',
              '4. Use this English correction format: "You said: ... -> Better: ..."',
              '5. In the Korean translation, use this format: "내 표현: ... -> 추천: [English corrected sentence]" and explain in Korean.',
              '6. Do NOT write a full model answer. Do NOT replace the learner’s whole answer.',
              '7. Give 2-3 reusable sentence patterns that are close to what the learner tried to say.',
              '8. Keep every item useful for the next attempt.'
            ].join('\n')
          }
        ]
      })
    });

    const responseText = await upstream.text();
    let data;
    try { data = JSON.parse(responseText); } catch { data = { raw: responseText }; }

    if (!upstream.ok) {
      return res.status(upstream.status || 500).json({
        error: cleanOpenAIError(data?.error?.message) || 'OpenAI feedback failed.',
        model
      });
    }

    const content = String(data?.choices?.[0]?.message?.content || '').trim();
    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = { items: content.split(/\n+/).filter(Boolean), speechText: content }; }
    const items = Array.isArray(parsed.items) ? parsed.items.map(String).filter(Boolean).slice(0, 10) : [];
    const speechText = items.join(' ');

    return res.status(200).json({ items, speechText, model });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Feedback server error.' });
  }
}

function normalizeFeedbackModel(value) {
  const model = String(value || '').trim();
  if (/^sk-/.test(model)) return 'gpt-4o-mini';
  return model || 'gpt-4o-mini';
}

function cleanOpenAIError(message) {
  return String(message || '')
    .replace(/sk-[A-Za-z0-9_-]+/g, 'sk-...')
    .replace(/'sk-[^']+'/g, "'sk-...'");
}
