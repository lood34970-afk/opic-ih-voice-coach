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
    const audioBase64 = body.audioBase64;
    const mimeType = body.mimeType || 'audio/webm';
    const filename = body.filename || filenameFromMime(mimeType);
    const prompt = body.prompt || 'This is an English OPIc practice answer by a Korean speaker. Transcribe the spoken English accurately. Do not translate.';

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required.' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    if (!audioBuffer.length) {
      return res.status(400).json({ error: 'Audio was empty.' });
    }

    async function requestTranscription(model) {
      const blob = new Blob([audioBuffer], { type: mimeType });
      const form = new FormData();
      form.append('file', blob, filename);
      form.append('model', model);
      form.append('language', 'en');
      form.append('prompt', prompt);

      const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form
      });

      const responseText = await upstream.text();
      let data;
      try { data = JSON.parse(responseText); } catch { data = { raw: responseText }; }
      return { ok: upstream.ok, status: upstream.status, data, text: String(data.text || '').trim(), model };
    }

    const preferredModel = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-transcribe';
    let result = await requestTranscription(preferredModel);
    let fallback = null;

    if ((!result.ok || !result.text) && preferredModel !== 'whisper-1') {
      fallback = await requestTranscription('whisper-1');
      if (fallback.ok && fallback.text) result = fallback;
    }

    if (!result.ok) {
      return res.status(result.status || 500).json({
        error: result.data?.error?.message || 'OpenAI transcription failed.',
        detail: result.data,
        fallback
      });
    }

    return res.status(200).json({
      text: result.text,
      model: result.model,
      bytes: audioBuffer.length,
      mimeType,
      filename,
      fallbackUsed: result.model !== preferredModel,
      raw: result.data
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Transcription server error.' });
  }
}

function filenameFromMime(mimeType) {
  const clean = String(mimeType || '').split(';')[0].toLowerCase();
  if (clean.includes('mp4')) return 'opic-answer.mp4';
  if (clean.includes('mpeg')) return 'opic-answer.mp3';
  if (clean.includes('mp3')) return 'opic-answer.mp3';
  if (clean.includes('wav')) return 'opic-answer.wav';
  if (clean.includes('ogg')) return 'opic-answer.ogg';
  if (clean.includes('webm')) return 'opic-answer.webm';
  return 'opic-answer.webm';
}
