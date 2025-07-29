import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: This is the standard way to handle API keys in serverless environments.
// The API key is stored as an environment variable, NOT in the code.
export default async (req, res) => {
  try { // Wrap the entire function in a try-catch
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: API Key is missing.' });
    }

    console.log('API_KEY is present. Length:', API_KEY.length); // Log API key presence

    const genAI = new GoogleGenerativeAI(API_KEY);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Access the body directly from req, as Vercel parses it for us
  const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Responde a la siguiente pregunta de forma concisa: ${query}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ result: text });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process AI request.' });
  }
  } catch (error) {
    console.error('Global error processing request:', error); // More specific log
    // Ensure this always returns JSON
    res.status(500).json({ error: 'An unexpected server error occurred.', details: error.message });
  }
};
