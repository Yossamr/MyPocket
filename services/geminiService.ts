import { GoogleGenAI } from "@google/genai";
import { AICommandResult, TransactionType, Transaction, Budget, SavingGoal } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const apiKey = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const parseAIInput = async (input: string, existingCategories: string[] = [], existingGoals: SavingGoal[] = []): Promise<AICommandResult | null> => {
  if (!apiKey) {
    console.error("API Key is missing.");
    return null;
  }

  const categoriesStr = existingCategories.join(', ');
  const goalsStr = existingGoals.map(g => `ID "${g.id}": "${g.name}"`).join(', ');

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

      **Input to Parse:** "${input}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let text = response.text;
    if (!text) return null;
    
    // Clean up markdown code blocks if present (e.g. ```json ... ```)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as AICommandResult;
  } catch (error) {
    console.error("Gemini Request Failed:", error);
    return null;
  }
};

export const getFinancialAdvice = async (
    transactions: Transaction[], 
    budgets: Budget[], 
    goals: SavingGoal[]
): Promise<string> => {
  if (!apiKey) return "عفواً، مفتاح API غير موجود. تأكد من إعدادات التطبيق.";

  const now = new Date();
  const currentMonthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const totalIncome = currentMonthTx.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentMonthTx.filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.CREDIT_SPEND).reduce((s, t) => s + t.amount, 0);
  
  // Calculate top spending categories
  const expensesByCategory: Record<string, number> = {};
  currentMonthTx
    .filter(t => t.type === TransactionType.EXPENSE || t.type === TransactionType.CREDIT_SPEND)
    .forEach(t => {
       expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });
  
  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat, amount]) => `${cat}: ${amount}`)
    .join(', ');

  const prompt = `Act as a funny, street-smart Egyptian financial advisor ("أخوك الناصح").
      Analyze the user's financial data for this month:
      - Total Income: ${totalIncome} EGP
      - Total Expenses: ${totalExpense} EGP
      - Remaining Balance: ${totalIncome - totalExpense} EGP
      - Top Spending Categories: ${topCategories || "No significant spending yet"}
      - Active Saving Goals: ${goals.length}

      **Instructions:**
      1. Speak in Egyptian Slang (عامية مصرية).
      2. If expenses > income, be dramatic and warn them (e.g., "يانهار ابيض!").
      3. If they are saving well, praise them (e.g., "يا ولا يا حريف").
      4. Give 3 specific, actionable tips based on their TOP CATEGORIES.
      5. Keep it short (max 100 words) and use emojis.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "عفواً، الشبكة وحشة، جرب كمان شوية!";
  } catch (error) {
    console.error("Gemini Request Failed:", error);
    return "عفواً، حدث خطأ أثناء الاتصال بالمستشار الذكي.";
  }
};