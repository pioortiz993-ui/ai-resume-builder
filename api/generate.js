export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing on server.' });
  }

  const { task, payload } = req.body;
  if (!task || !payload) {
    return res.status(400).json({ error: 'Missing task or payload in request body.' });
  }

  let prompt = '';

  switch (task) {
    case 'improve_text':
      prompt = `You are an expert career consultant. Rewrite and enhance the following description for a resume section (${payload.sectionType}). 
Make it concise, actionable, and professional. 
CRITICAL RULE: Strictly rely on the user's provided facts. Do NOT invent new job titles, metrics, or experiences that were not provided.
User Input: "${payload.text}"`;
      break;

    case 'suggest_skills':
      prompt = `You are a technical recruiter. Based on the following work experience and project descriptions, suggest 8 relevant technical and soft skills.
Return ONLY a comma-separated list of skills, nothing else.
Input: "${payload.text}"`;
      break;

    case 'analyze_job':
      prompt = `Analyze the following job description and return a structured JSON breakdown containing exactly these keys: "technicalSkills" (array of strings), "softSkills" (array of strings), "keywords" (array of strings), and "responsibilities" (array of strings). Do NOT include markdown code fences or backticks—return raw JSON only.
Job Description:
"${payload.text}"`;
      break;

    case 'generate_cover_letter':
      prompt = `You are a professional hiring advisor. Write a personalized cover letter using the following information:
- Applicant Name: ${payload.fullName}
- Target Position: ${payload.jobPosition}
- Company Name: ${payload.companyName}
- Desired Tone: ${payload.tone || 'Professional'}
- Relevant Skills: ${payload.skills}
- Relevant Experience: ${payload.experience}
- Reason for Applying: ${payload.reason}
- Target Job Description: ${payload.jobDescription}

Ensure the letter includes a professional greeting, introduction, alignment of skills with job requirements, enthusiasm for the role, and a professional closing. Strictly stick to the supplied facts without fabricating qualifications.`;
      break;

    default:
      return res.status(400).json({ error: 'Invalid task specified.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Gemini API call failed.' });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({ result: generatedText });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}