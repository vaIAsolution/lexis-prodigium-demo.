import { GoogleGenerativeAI } from '@google/generative-ai';

export default async (req, res) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables.');
      return res.status(500).json({ error: 'Server configuration error: API Key is missing.' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query, context } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    let prompt = '';

    if (query.startsWith("Busca y analiza la siguiente tesis o jurisprudencia:")) {
      prompt = `Actúa como un experto en jurisprudencia mexicana. Analiza la siguiente solicitud y proporciona un resumen claro, conciso y relevante de la tesis o jurisprudencia, incluyendo su registro, fecha de publicación, hechos relevantes, criterio jurídico y su impacto práctico en el derecho mexicano. Utiliza un formato profesional y fácil de leer, con encabezados y párrafos bien definidos. ${query}`;
    } else if (query.startsWith("Realiza un análisis de estrategia legal tipo FODA para el siguiente caso:")) {
      prompt = `Eres un Asistente Legal de IA de élite para un prestigioso bufete de abogados en México. Tu función principal es **ejecutar la investigación, no solo sugerirla**. Debes ser preciso, rápido y accionable.\n\nRealiza un análisis FODA (Fortalezas, Oportunidades, Debilidades, Amenazas) para el siguiente caso.\n\n**REGLAS OBLIGATORIAS (DEBES CUMPLIRLAS AL 100%):**\n1.  **PUNTO DE PARTIDA OBLIGATORIO PARA DROGAS:** Si el caso involucra posesión de narcóticos, tu primer paso **siempre** es analizar la tabla del **Artículo 479 de la Ley General de Salud**. Debes comparar las cantidades del caso con las de la tabla y mencionarlo explícitamente en el análisis FODA.\n2.  **ANÁLISIS APLICADO Y CUANTITATIVO:** Si el caso depende de datos específicos (gramos, plazos, porcentajes), **DEBES** investigar el dato exacto en la ley y citarlo directamente en el análisis FODA. **NO PUEDES** decir "revisar la ley", debes decir "la ley dice X".\n3.  **FUENTES COMPLETAS Y ESPECÍFICAS:** Debes citar **TODAS** las leyes y artículos relevantes, tanto sustantivos (ej. Ley del ISR, Código Civil, Ley General de Salud) como adjetivos (ej. Código Fiscal de la Federación, CNPP). Es **OBLIGATORIO** que cites los números de artículo específicos. **TIENES PROHIBIDO** usar frases como \`(especificar artículos)\` o \`(investigar después)\`.\n4.  **ENLACES FUNCIONALES:** En la sección final **'Fuentes Consultadas'**, **DEBES** formatear cada fuente como un **hipervínculo en formato Markdown**. El enlace debe apuntar a una fuente oficial (preferentemente \`diputados.gob.mx\`).\n    *   **Formato Correcto:** \`[Ley del Impuesto Sobre la Renta, Artículo 91](https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf)\`\n5.  **AUTOCORRECCIÓN FINAL:** Antes de generar la respuesta final, revisa tu propio trabajo. ¿Cumpliste con las 4 reglas anteriores? ¿Citaste los datos de la LGS si aplicaba? ¿Incluiste TODOS los artículos relevantes? ¿Creaste los enlaces? Si no es así, corrige tu borrador antes de presentarlo.\n\n**CASO A ANALIZAR:** ${context}`;
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
};