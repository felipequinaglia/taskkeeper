import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// We'll use the 2.5 model explicitly
const MODEL_NAME = "gemini-2.5-flash";

// Zod schema for validation after receiving the response
const taskSchema = z.object({
  title: z.string(),
  description: z.string(),
  reply: z.string(),
});

// Manually create a simple schema for the Google API
const googleApiSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    description: { type: "STRING" },
    reply: { type: "STRING", description: "A very short, natural confirmation message in the same language as the user's input." },
  },
  required: ["title", "description", "reply"],
};

export const createTaskFromText = async (text) => {
    // Using the stable model identifier
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: googleApiSchema,
    };

    const prompt = `
        Extract the title and description of a task from the following message.
        Also, generate a very short, friendly confirmation message (reply) to the user.
        
        IMPORTANT: Everything (title, description, and reply) MUST be in the same language as the message below.
        
        Message: "${text}"
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });
    const response = await result.response;
    const taskData = response.text();
    
    // Validate the response with our more robust Zod schema
    const task = taskSchema.parse(JSON.parse(taskData));

    return task;
};

export const saveTaskToDb = async (supabase, userId, title, description) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ user_id: userId, title, description }])
    .select();

  if (error) throw error;
  return data[0];
};
