import { GoogleGenerativeAI } from '@google/generai';

// IMPORTANT: This is the standard way to handle API keys in serverless environments.
// The API key is stored as an environment variable, NOT in the code.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { query, context } = await req.json();

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Actuando como un asistente legal experto en derecho mexicano, analiza la siguiente pregunta y contexto.
      Proporciona una respuesta clara, estructurada y fundamentada.
      
      Contexto del caso (si aplica): ${context || 'No proporcionado'}
      
      Pregunta del usuario: "${query}"

      Respuesta:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ result: text });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process AI request.' });
  }
};
