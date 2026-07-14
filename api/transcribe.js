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

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const audioBase64 = body.audioBase64;
    const mimeType = body.mimeType || 'audio/webm';
    const filename = body.filename || 'opic-answer.webm';
    const prompt = body.prompt || 'This is an English OPIc practice answer by a Korean speaker. Transcribe the spoken English accurately. Do not translate.';

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required.' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    if (!audioBuffer.length) {
      return res.status(400).json({ error: 'Audio was empty.' });
    }

    const file = new File([audioBuffer], filename, { type: mimeType });
    const form = new FormData();
    form.append('file', file);
    form.append('model', process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-transcribe');
    form.append('language', 'en');
    form.append('prompt', prompt);

    const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || 'OpenAI transcription failed.', detail: data });
    }

    return res.status(200).json({ text: data.text || '', raw: data });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Transcription server error.' });
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
