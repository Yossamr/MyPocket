/**
 * Cloudflare Worker for My Pocket
 * 
 * 1. Create a worker at workers.cloudflare.com
 * 2. Paste this code.
 * 3. Add variable GEMINI_API_KEY in Settings -> Variables
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const body = await request.json();

    try {
      if (url.pathname === '/parse') {
        return await handleParse(body, env);
      } else if (url.pathname === '/advice') {
        return await handleAdvice(body, env);
      }
      return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
      });
    }
  }
};

async function handleParse(data, env) {
  const { input, categories, goals } = data;
  const categoriesStr = categories.join(', ');
  const goalsStr = goals.map(g => `ID "${g.id}": "${g.name}"`).join(', ');

  const prompt = `You are a strict financial parser for the app "My Pocket". 
      Map user input (Arabic/English) to a JSON object.

      **Context:**
      - Existing Categories: [${categoriesStr}]
      - Existing Saving Goals: [${goalsStr}]
      - Default Category: "General" (عام) if not specified.

      **Recognition Rules (Prioritize strictly):**
      1. **TRANSACTION**: If input has a number and implies spending, income, debt, or saving.
         - Keywords (Expense): "صرفت", "جبت", "اشتريت", "دفع", "spent", "paid", "bought".
         - Keywords (Income): "قبضت", "خدت", "جالي", "income", "received", "salary".
         - Keywords (Saving): "حوشت", "شلت", "saved", "piggy bank".
         - Keywords (Debt): "استلفت", "سلف", "borrowed", "lent".
         - **IMPORTANT**: If the user says "saved for X" and X matches an Existing Goal Name, set type to 'SAVING' AND put the goal's ID in 'data.goalId'.
      2. **BUDGET**: If input mentions "budget", "limit", "ميزانية", "حد".
      3. **GOAL**: If input mentions "goal", "target", "save for", "عايز اجيب", "هدف" (Creating a NEW goal).

      **Examples (Few-Shot):**
      - Input: "صرفت 50 مواصلات" -> Action: TRANSACTION, Type: EXPENSE, Amount: 50, Category: "مواصلات"
      - Input: "جبت اكل ب 100" -> Action: TRANSACTION, Type: EXPENSE, Amount: 100, Category: "اكل"
      - Input: "قبضت 5000" -> Action: TRANSACTION, Type: INCOME, Amount: 5000, Category: "راتب"
      - Input: "ميزانية اكل 3000" -> Action: BUDGET, Category: "اكل", Amount: 3000
      - Input: "حوشت 1000 للايفون" (Assuming 'iPhone' exists with ID '123') -> Action: TRANSACTION, Type: SAVING, Amount: 1000, Category: "تحويش", GoalId: "123"

      **Input to Parse:** "${input}"

      Output STRICT JSON.`;

  const result = await callGemini(prompt, env, true);
  return new Response(JSON.stringify(result), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}

async function handleAdvice(data, env) {
  const { transactions, budgets, goals } = data;
  
  // Logic to process data strings similar to original service
  const now = new Date();
  const currentMonthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const totalIncome = currentMonthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentMonthTx.filter(t => t.type === 'EXPENSE' || t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
  
  const prompt = `Act as a friendly Egyptian financial advisor ("أخوك الناصح").
      Analyze data for this month:
      - Income: ${totalIncome}
      - Expenses: ${totalExpense}
      - Goals: ${goals.length}
      
      Give 3 very short, bulleted tips in Egyptian Arabic. Be encouraging but firm if overspending.`;

  const result = await callGemini(prompt, env, false);
  return new Response(JSON.stringify({ advice: result }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}

async function callGemini(prompt, env, jsonMode) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  if (jsonMode) {
     payload.generationConfig = { response_mime_type: "application/json" };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (jsonMode) {
     return JSON.parse(text);
  }
  return text;
}