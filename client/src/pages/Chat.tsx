import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useTasks } from '@/contexts/TaskContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { fetchTasks } = useTasks();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim() || loading) return;
    sendMessage(message);
  };

  const sendMessage = async (text: string) => {
    const userMessage: Message = { sender: 'user', text };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    setMessage('');
    setLoading(true);
    setError(null);

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
      const errorMsg = err.response?.data?.error || 'Failed to send message.';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: '[ERROR]',
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
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
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '[ERROR]',
        description: 'Failed to access microphone. Please check permissions.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudio = async (audio: string) => {
    setLoading(true);
    setError(null);
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
      const errorMsg = err.response?.data?.error || 'Failed to send audio.';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: '[ERROR]',
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="border-2 border-white bg-black h-[calc(100vh-12rem)]">
        <div className="border-b-2 border-white p-4">
          <pre className="text-primary text-xs leading-tight">
{`╔════════════════════════════════════════╗
║  KEEPER AI INTERFACE - CHAT PROTOCOL   ║
╚════════════════════════════════════════╝`}
          </pre>
          <p className="text-muted-foreground text-xs mt-2">
            &gt; TYPE OR USE VOICE INPUT TO CREATE TASKS
          </p>
        </div>

        <ScrollArea className="h-[calc(100%-220px)] p-4" ref={scrollRef}>
          <div className="space-y-4 font-mono">
            {chatHistory.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-sm mb-2">[SYSTEM READY]</p>
                <p className="text-xs">AWAITING INPUT...</p>
              </div>
            )}
            {chatHistory.map((chat, index) => (
              <div key={index} className="space-y-1">
                <p className={`text-xs ${chat.sender === 'user' ? 'text-accent' : 'text-primary'}`}>
                  {chat.sender === 'user' ? '&gt; USER:' : '&gt; KEEPER:'}
                </p>
                <div className={`border ${chat.sender === 'user' ? 'border-accent' : 'border-primary'} p-3`}>
                  <p className="text-sm text-white whitespace-pre-wrap">{chat.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="space-y-1">
                <p className="text-xs text-primary">&gt; KEEPER:</p>
                <div className="border border-primary p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-sm text-white">[PROCESSING...]</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t-2 border-white p-4 space-y-3">
          {error && (
            <div className="border border-destructive p-2">
              <p className="text-destructive text-xs">[ERROR] {error}</p>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="&gt; Enter command..."
              disabled={loading || isRecording}
              className="flex-1 bg-black text-white border-white focus:border-primary rounded-none"
            />
            <Button 
              type="submit" 
              disabled={loading || isRecording || !message.trim()}
              className="bg-primary text-black hover:bg-primary/80 border-2 border-primary rounded-none font-bold"
            >
              [ SEND ]
            </Button>
          </form>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? 'destructive' : 'secondary'}
            className="w-full border-2 rounded-none font-bold"
            disabled={loading}
          >
            {isRecording ? '[ ● RECORDING... CLICK TO STOP ]' : '[ ○ VOICE INPUT ]'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
