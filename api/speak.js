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
    const input = String(body.text || '').trim().slice(0, 3600);
    if (!input) {
      return res.status(400).json({ error: 'text is required.' });
    }

    const model = normalizeTtsModel(process.env.OPENAI_TTS_MODEL);
    const voice = normalizeVoice(process.env.OPENAI_TTS_VOICE);
    const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        voice,
        input,
        response_format: 'mp3',
        speed: normalizeSpeed(process.env.OPENAI_TTS_SPEED),
        instructions: 'Speak like a calm OPIc coach at a slower, comfortable study pace. Use clear American English for English feedback and natural Korean for Korean explanations. Pause briefly between feedback bullets.'
      })
    });

    if (!upstream.ok) {
      const responseText = await upstream.text();
      let data;
      try { data = JSON.parse(responseText); } catch { data = { raw: responseText }; }
      return res.status(upstream.status || 500).json({
        error: cleanOpenAIError(data?.error?.message) || 'OpenAI text-to-speech failed.',
        model,
        voice
      });
    }

    const audio = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).json({
      audioBase64: audio.toString('base64'),
      mimeType: 'audio/mpeg',
      model,
      voice,
      bytes: audio.length
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Speech server error.' });
  }
}

function normalizeTtsModel(value) {
  const model = String(value || '').trim();
  if (/^sk-/.test(model)) return 'gpt-4o-mini-tts';
  return model || 'gpt-4o-mini-tts';
}

function normalizeSpeed(value) {
  const speed = Number(value || '0.78');
  if (!Number.isFinite(speed)) return 0.78;
  return Math.min(1.2, Math.max(0.6, speed));
}

function normalizeVoice(value) {
  const voice = String(value || '').trim().toLowerCase();
  const allowed = new Set(['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer']);
  if (allowed.has(voice)) return voice;
  return 'nova';
}

function cleanOpenAIError(message) {
  return String(message || '')
    .replace(/sk-[A-Za-z0-9_-]+/g, 'sk-...')
    .replace(/'sk-[^']+'/g, "'sk-...'");
}
