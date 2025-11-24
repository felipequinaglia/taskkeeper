import db from '../db.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Zod schema for validation after receiving the response
const taskSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// Manually create a simple schema for the Google API
const googleApiSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    description: { type: "STRING" },
  },
  required: ["title", "description"],
};

export const createTaskFromText = async (text) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: googleApiSchema, // Use the simple, manual schema
        },
    });

    const prompt = `
        Extract the title and description of a task from the following message:
        "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const taskData = response.text();
    
    // Validate the response with our more robust Zod schema
    const task = taskSchema.parse(JSON.parse(taskData));

    return task;
};

export const saveTaskToDb = async (userId, title, description) => {
  const newTask = await db.query(
    'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
    [userId, title, description]
  );
  return newTask.rows[0];
};
