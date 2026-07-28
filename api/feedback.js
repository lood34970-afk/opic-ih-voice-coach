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
        max_tokens: 1600,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              'You are an expert OPIc speaking coach for a Korean learner aiming for IH.',
              'Evaluate whether the answer directly answers the question.',
              'Give practical feedback, concise but detailed.',
              'Focus on OPIc IH: relevance, structure, detail, grammar, and natural correction of the learner’s own sentences.',
              'In feedback items, do not replace the learner’s whole answer. Correct the learner’s actual wording with before/after examples.',
              'Return only valid JSON with keys items, assessment, and modelAnswer. items must be an array of 6-8 English strings.',
              'assessment must contain level, levelPosition, confidence, and reasonKo.',
              'Use this continuous levelPosition scale: NL=0, NM=1, NH=2, IL=3, IM1=4, IM2=5, IM3=6, IH=7, AL=8. Decimals are required when the answer falls between levels.',
              'Choose level as the nearest named level to levelPosition. confidence must be an integer from 0 to 100.',
              'reasonKo must be one short Korean sentence explaining the strongest evidence and the main limitation.',
              'Judge task completion, discourse length and organization, grammar, vocabulary, fluency, and specificity conservatively. This is an unofficial practice estimate.',
              'Every feedback item must be in English only. Do not include Korean translations in items.',
              'modelAnswer must be a natural 100-140 word OPIc IH-level answer to the exact question.',
              'The model answer must use connected paragraph-level speech, specific personal detail, natural transitions, and accurate major time frames when relevant.',
              'Write modelAnswer in English only, without a title, label, bullet points, or coaching notes.'
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
              '5. Do not put a full replacement answer inside items.',
              '6. Give 2-3 reusable sentence patterns that are close to what the learner tried to say.',
              '7. Keep every item useful for the next attempt.',
              '8. Write all feedback items in English only.',
              '9. Create a separate modelAnswer that directly answers this question at a realistic IH level.',
              '10. Make modelAnswer useful for listening practice, but do not copy the learner transcript.'
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
    const assessment = normalizeAssessment(parsed.assessment);
    const modelAnswer = normalizeModelAnswer(parsed.modelAnswer);

    return res.status(200).json({ items, speechText, assessment, modelAnswer, model });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Feedback server error.' });
  }
}

function normalizeModelAnswer(value) {
  return String(value || '')
    .replace(/^(model answer|sample answer)\s*:\s*/i, '')
    .trim()
    .slice(0, 2400);
}

function normalizeAssessment(value) {
  if (!value || typeof value !== 'object') return null;
  const levels = ['NL', 'NM', 'NH', 'IL', 'IM1', 'IM2', 'IM3', 'IH', 'AL'];
  const suppliedLevel = String(value?.level || '').toUpperCase();
  const levelIndex = levels.indexOf(suppliedLevel);
  const rawPosition = Number(value?.levelPosition);
  const levelPosition = Number.isFinite(rawPosition)
    ? Math.max(0, Math.min(8, rawPosition))
    : Math.max(0, levelIndex);
  const nearestLevel = levels[Math.round(levelPosition)] || 'NL';
  const confidence = Math.max(0, Math.min(100, Math.round(Number(value?.confidence) || 0)));
  const reasonKo = String(value?.reasonKo || '답변의 과제 수행과 전달력을 종합해 추정했습니다.').slice(0, 180);
  return { level: nearestLevel, levelPosition, confidence, reasonKo };
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
