
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from "../types";

const generatePrompt = (topic: string, grade: string, count: number) => {
  return `Create a comprehensive 50-question English test for Grade ${grade} students in Vietnam (Secondary School - THCS).
  The test MUST strictly follow the "Cong van 5512" matrix and structure:
  
  1. STRUCTURE (Total 50 questions):
     - Part I: Phonetics (5 questions) - Focus on pronunciation and word stress.
     - Part II: Lexico-Grammar (20 questions) - Focus on "${topic}", tenses, vocabulary, and grammar of Grade ${grade}.
     - Part III: Communication (2 questions) - Social interactions.
     - Part IV: Reading (15 questions) - 1 Cloze test passage (5 items) and 2 Reading comprehension passages (5 items each).
     - Part V: Writing (8 questions) - 4 items for error identification and 4 items for sentence transformation (choosing the closest meaning).

  2. DIFFICULTY MATRIX:
     - 40% Recognition (Nhận biết)
     - 30% Understanding (Thông hiểu)
     - 20% Application (Vận dụng)
     - 10% High Application (Vận dụng cao)

  3. FORMAT:
     - All questions must be 4-option multiple choice (A, B, C, D).
     - Provide explanation in Vietnamese for each question.
     - Output JSON ONLY.

  Return an array of 50 question objects.`;
};

export const generateQuestions = async (topic: string, grade: string, count: number): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // We use gemini-3-pro-preview for 50 questions to ensure complex reasoning and higher token limit
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: generatePrompt(topic, grade, count),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              difficulty: { type: Type.STRING },
              explanation: { type: Type.STRING },
              section: { type: Type.STRING, description: "Phonetics, Grammar, Reading, Writing, etc." }
            },
            required: ["text", "options", "correctAnswer", "difficulty", "explanation", "section"]
          }
        }
      }
    });

    const rawData = response.text;
    if (!rawData) throw new Error("No data returned from Gemini");

    const parsedData = JSON.parse(rawData);
    
    return parsedData.map((q: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: mapDifficulty(q.difficulty),
      explanation: q.explanation,
      section: q.section || "General"
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const mapDifficulty = (str: string): Difficulty => {
  const s = str.toLowerCase();
  if (s.includes("cao")) return Difficulty.VDC;
  if (s.includes("vận dụng")) return Difficulty.VD;
  if (s.includes("thông hiểu")) return Difficulty.TH;
  return Difficulty.NB;
};
