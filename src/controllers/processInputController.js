import { SpeechClient } from '@google-cloud/speech';
import { createTaskFromText, saveTaskToDb } from "../services/taskService.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

let credentials;
// Check if running in a deployed environment (e.g., Heroku) and GOOGLE_APPLICATION_CREDENTIALS_JSON is set
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
        credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        console.log("Google Cloud credentials loaded from environment variable.");
    } catch (e) {
        console.error("Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
        // Fallback or throw, depending on desired behavior
        throw new Error("Invalid Google Cloud credentials JSON in environment variable.");
    }
} else {
    // Fallback for local development, assuming the key file is present
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const keyFilePath = path.join(__dirname, '../../taskkeeper-477700-3189797cef58.json');
    try {
        credentials = JSON.parse(readFileSync(keyFilePath, 'utf8'));
        console.log("Google Cloud credentials loaded from local file.");
    } catch (e) {
        console.error("Error loading Google Cloud credentials from local file:", e);
        throw new Error("Google Cloud credentials file not found or invalid.");
    }
}


const speechClient = new SpeechClient({
    credentials
});

export const processInput = async (req, res) => {
    try {
        const { audio } = req.body;
        const userId = req.user.id;
        let transcription = '';

        if (audio) {
            console.log("Received audio input. Attempting speech recognition.");
            const request = {
                audio: {
                    content: audio,
                },
                config: {
                    encoding: 'WEBM_OPUS',
                    sampleRateHertz: 48000,
                    languageCode: 'pt-BR',
                },
            };

            const [response] = await speechClient.recognize(request);
            if (response.results && response.results.length > 0) {
                transcription = response.results
                    .map(result => result.alternatives[0].transcript)
                    .join('\n');
                console.log("Speech recognized, transcription:", transcription);
            } else {
                console.log("Speech recognition returned no results.");
                // Optionally handle this case, e.g., return a specific error or prompt for clearer audio
                return res.status(400).json({ error: "Could not transcribe audio. Please try again with clearer speech." });
            }
        } else if (req.body.text) {
            transcription = req.body.text;
            console.log("Received text input, transcription:", transcription);
        } else {
            console.error("No audio or text data provided in the request body.");
            return res.status(400).json({ error: "Audio or text data is required." });
        }

        console.log("Attempting to create task from transcription.");
        const { title, description } = await createTaskFromText(transcription);
        console.log("Task created from text:", { title, description });

        console.log("Attempting to save task to database.");
        const newTask = await saveTaskToDb(userId, title, description);
        console.log("Task saved to database:", newTask);

        res.status(200).json({ reply: `I have created the task: "${newTask.title}"` });
    } catch (error) {
        console.error("Error processing input in processInputController:", error);
        res.status(500).json({ error: "Failed to process input. Check server logs for details." });
    }
};
