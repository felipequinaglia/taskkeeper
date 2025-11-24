import React, { useState, useRef } from 'react';
import api from '../api';
import { useTasks } from '../contexts/TaskContext';
import styles from './Chat.module.css';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { fetchTasks } = useTasks();

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    sendMessage(message);
  };
  
  const sendMessage = async (text: string) => {
    const userMessage: Message = { sender: 'user', text };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/api/chat',
        { message: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChatHistory([...newChatHistory, { sender: 'bot', text: response.data.reply }]);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        if (base64Audio) {
          sendAudio(base64Audio);
        }
      };
      audioChunks.current = [];
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };
  
  const sendAudio = async (audio: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/api/process-input',
        { audio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChatHistory([...chatHistory, { sender: 'bot', text: response.data.reply }]);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send audio.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.chatContainer}>
      <h1>Chat with Keeper</h1>
      <div className={styles.chatHistory}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={`${styles.chatMessage} ${chat.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
            <p><strong>{chat.sender === 'user' ? 'You' : 'Keeper'}:</strong> {chat.text}</p>
          </div>
        ))}
        {loading && (
          <div className={`${styles.chatMessage} ${styles.botMessage}`}>
            <p><strong>Keeper:</strong> Thinking...</p>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className={styles.chatForm}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.chatInput}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
      <button onClick={isRecording ? stopRecording : startRecording} className={styles.recordButton}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Chat;

