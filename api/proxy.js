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

    let prompt = ``;

    if (query.startsWith("Busca y analiza la siguiente tesis o jurisprudencia:")) {
      prompt = `Actúa como un experto en jurisprudencia mexicana. Analiza la siguiente solicitud y proporciona un resumen claro, conciso y relevante de la tesis o jurisprudencia, incluyendo su registro, fecha de publicación, hechos relevantes, criterio jurídico y su impacto práctico en el derecho mexicano. Utiliza un formato profesional y fácil de leer, con encabezados y párrafos bien definidos. ${query}`;
    } else if (query.startsWith("Realiza un análisis de estrategia legal tipo FODA para el siguiente caso:")) {
      prompt = `Actúa como un estratega legal experto en litigios complejos. Realiza un análisis FODA (Fortalezas, Oportunidades, Debilidades, Amenazas) detallado para el siguiente caso legal. Estructura tu respuesta con encabezados claros para cada sección (Fortalezas, Oportunidades, Debilidades, Amenazas) y proporciona puntos clave concisos y accionables. El caso es: ${context}`;
    } else if (query.startsWith("Genera un borrador del siguiente documento:")) {
      prompt = `Actúa como un abogado redactor de documentos legales de alto nivel en México, con la capacidad de interpretar y transformar solicitudes generales en prompts profesionales. Tu objetivo es generar un borrador completo, pulcro, elegante, y legalmente fundamentado del siguiente documento, emulando la calidad y el estilo de los mejores bufetes de abogados en México (como Creel, García-Cuéllar, Aiza y Enríquez; Galicia Abogados; González Calvillo; Mijares, Angoitia, Cortés y Fuentes; Nader, Hayaux & Goebel; Santamarina y Steta; Von Wobeser y Sierra; Basham, Ringe y Correa; Hogan Lovells BSTL; White & Case). Asegúrate de que el lenguaje sea formal, preciso y técnico-jurídico. Incluye secciones claras, numeración progresiva si aplica (ej. "I. HECHOS", "II. DERECHO"), y utiliza un formato que facilite la lectura y comprensión. Si es un contrato, incluye cláusulas esenciales y estructura lógica. Si es una demanda, estructura las partes fundamentales (proemio, prestaciones, hechos, derecho, puntos petitorios) de manera clara y concisa. Simula la inclusión de fundamentos legales relevantes (artículos de ley, jurisprudencia aplicable) en el texto o en notas al pie, indicando la fuente (ej. "Artículo X de la Ley Y", "Jurisprudencia Z"). Adapta el contenido y las referencias legales a la jurisdicción de San Luis Potosí, si los detalles clave lo sugieren. Asegúrate de que el formato sea de fácil lectura, con párrafos bien espaciados, uso adecuado de negritas para destacar puntos clave y sin caracteres extraños. El documento solicitado es: ${query}. Detalles clave: ${context}`;
    } else {
      prompt = `Responde a la siguiente pregunta de forma concisa: ${query}`;
    }

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
