import { getSupabase } from '../supabaseClient.js';
import { createTaskFromText, saveTaskToDb } from "../services/taskService.js";

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const supabase = getSupabase(req.token);

    const { title, description, reply } = await createTaskFromText(message);

    const newTask = await saveTaskToDb(supabase, userId, title, description);

    // Save User Message to History
    await supabase.from('messages').insert({
      user_id: userId,
      role: 'user',
      content: message
    });

    // Save Assistant Message to History
    await supabase.from('messages').insert({
      user_id: userId,
      role: 'assistant',
      content: reply || `I have created the task: "${newTask.title}"`
    });

    res.status(200).json({ reply: reply || `I have created the task: "${newTask.title}"` });
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
    res.status(500).json({ error: "Failed to get a reply from Gemini." });
  }
};
