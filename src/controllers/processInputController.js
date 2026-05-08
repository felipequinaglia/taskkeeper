import Groq from 'groq-sdk';
import { getSupabase } from '../supabaseClient.js';
import { createTaskFromText, saveTaskToDb } from "../services/taskService.js";
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import os from 'os';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const processInput = async (req, res) => {
    let tempFilePath = null;
    try {
        const { audio } = req.body;
        const userId = req.user.id;
        let transcription = '';

        if (audio) {
            console.log("Received audio input. Attempting Groq Whisper transcription.");
            
            // 1. Create a temporary file from base64
            const buffer = Buffer.from(audio, 'base64');
            tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}.webm`);
            writeFileSync(tempFilePath, buffer);

            // 2. Send to Groq
            const transcriptionResponse = await groq.audio.transcriptions.create({
                file: await import('fs').then(fs => fs.createReadStream(tempFilePath)),
                model: 'whisper-large-v3',
                // Removed hardcoded 'pt' to allow auto-detection for any language
                response_format: 'json',
                prompt: "Transcribe the following task exactly as spoken, maintaining proper capitalization and punctuation.", // General quality prompt
            });

            transcription = transcriptionResponse.text;
            console.log("Groq transcription successful:", transcription);

            // Clean up temp file immediately after API call
            unlinkSync(tempFilePath);
            tempFilePath = null;

        } else if (req.body.text) {
            transcription = req.body.text;
            console.log("Received text input, transcription:", transcription);
        } else {
            console.error("No audio or text data provided in the request body.");
            return res.status(400).json({ error: "Audio or text data is required." });
        }

        if (!transcription || transcription.trim() === '') {
            return res.status(400).json({ error: "Could not extract text from input." });
        }

        console.log("Attempting to create task from transcription.");
        const { title, description, reply } = await createTaskFromText(transcription);
        console.log("Task created from text:", { title, description });

        console.log("Attempting to save task to database.");
        const supabase = getSupabase(req.token);
        const newTask = await saveTaskToDb(supabase, userId, title, description);
        console.log("Task saved to database:", newTask);

        res.status(200).json({ reply: reply || `I have created the task: "${newTask.title}"` });
    } catch (error) {
        console.error("Error processing input in processInputController:", error);
        
        // Clean up temp file if error occurred
        if (tempFilePath) {
            try { unlinkSync(tempFilePath); } catch (e) {}
        }

        res.status(500).json({ error: "Failed to process input. Check server logs for details." });
    }
};
