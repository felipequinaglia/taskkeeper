import { getSupabase } from '../supabaseClient.js';
import { createTaskFromText, saveTaskToDb } from "../services/taskService.js";

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const supabase = getSupabase(req.token);

    const { title, description, reply } = await createTaskFromText(message);

    const newTask = await saveTaskToDb(supabase, userId, title, description);

    res.status(200).json({ reply: reply || `I have created the task: "${newTask.title}"` });
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
    res.status(500).json({ error: "Failed to get a reply from Gemini." });
  }
};
