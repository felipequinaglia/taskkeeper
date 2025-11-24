import { createTaskFromText, saveTaskToDb } from "../services/taskService.js";

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // Assuming user information is available in req.user from authentication middleware

    const { title, description } = await createTaskFromText(message);

    const newTask = await saveTaskToDb(userId, title, description);

    res.status(200).json({ reply: `I have created the task: "${newTask.title}"` });
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
    res.status(500).json({ error: "Failed to get a reply from Gemini." });
  }
};
