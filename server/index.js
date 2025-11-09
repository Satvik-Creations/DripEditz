import express from 'express';
import { GoogleGenAI, Modality } from '@google/genai';

const app = express();
app.use(express.json({ limit: '50mb' }));

if (!process.env.API_KEY) {
  console.warn('Warning: API_KEY is not set. Set process.env.API_KEY before starting the server.');
}

const makeClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/api/edit', async (req, res) => {
  try {
    const { base64, mimeType, prompt } = req.body;
    if (!base64 || !prompt) return res.status(400).json({ error: 'Missing base64 image data or prompt' });
    if (!process.env.API_KEY) return res.status(500).json({ error: 'Server misconfigured: API_KEY not set' });

    const ai = makeClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: prompt }
        ]
      },
      config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    return res.json({ parts });
  } catch (err) {
    console.error('Error in /api/edit:', err);
    // Try to expose helpful error info when available without leaking secrets
    const message = err?.message || 'Unknown server error';
    return res.status(500).json({ error: message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`DripEditz server proxy listening on http://localhost:${port}`));
