import { useState, useRef, useEffect, useCallback } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import api from '@/lib/api';

interface Message {
  id?: string;
  sender: 'user' | 'keeper';
  text: string;
  audio_url?: string | null;
}

/* ── Audio Player ─────────────────────────────────────────── */
const AudioPlayer = ({ url }: { url: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{ marginTop: '0.3lh' }}>
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      <button
        size-="small"
        variant-={playing ? 'danger' : 'foreground2'}
        onClick={toggle}
      >
        {playing ? '[■ STOP]' : '[▶ PLAY NOTE]'}
      </button>
    </div>
  );
};

/* ── Chat Page ────────────────────────────────────────────── */
const HISTORY_LIMIT = 20;

const Chat = () => {
  const [message,        setMessage]        = useState('');
  const [chatHistory,    setChatHistory]    = useState<Message[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [hasMore,        setHasMore]        = useState(false);
  const [offset,         setOffset]         = useState(0);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [isRecording,    setIsRecording]    = useState(false);

  const mediaRecorder        = useRef<MediaRecorder | null>(null);
  const audioChunks          = useRef<Blob[]>([]);
  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight     = useRef(0);
  const isPrepending         = useRef(false);

  const { fetchTasks } = useTasks();

  /* ── History fetch ──────────────────────────────────────── */
  const loadHistory = useCallback(async (off: number, initial: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/messages', {
        params: { limit: HISTORY_LIMIT, offset: off },
        headers: { Authorization: `Bearer ${token}` },
      });

      const msgs: Message[] = res.data.messages ?? [];
      // Backend returns newest-first; reverse for chronological display
      const ordered = [...msgs].reverse();

      if (initial) {
        setChatHistory(ordered);
        setOffset(msgs.length);
      } else {
        // Save scroll height before prepend so we can restore it after render
        prevScrollHeight.current = messagesContainerRef.current?.scrollHeight ?? 0;
        isPrepending.current = true;
        setChatHistory(prev => [...ordered, ...prev]);
        setOffset(prev => prev + msgs.length);
      }

      setHasMore(msgs.length === HISTORY_LIMIT);
    } catch {
      // History is non-critical; silently skip
    } finally {
      setHistoryLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadHistory(0, true); }, [loadHistory]);

  /* ── Scroll management ──────────────────────────────────── */
  useEffect(() => {
    if (isPrepending.current && messagesContainerRef.current) {
      // After prepend: restore position so the view doesn't jump to top
      const newHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop = newHeight - prevScrollHeight.current;
      isPrepending.current = false;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  /* ── Send text ──────────────────────────────────────────── */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    const text = message;
    setChatHistory(prev => [...prev, { sender: 'user', text }]);
    setMessage('');
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        '/api/chat',
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatHistory(prev => [...prev, { sender: 'keeper', text: res.data.reply }]);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Recording ──────────────────────────────────────────── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = e => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const blob   = new Blob(audioChunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(',')[1];
          if (base64) sendAudio(base64);
        };
        audioChunks.current = [];
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch {
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  /* ── Send audio ─────────────────────────────────────────── */
  const sendAudio = async (audio: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(
        '/api/process-input',
        { audio },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show the user's transcribed voice note (with playback if URL returned)
      const userText = res.data.transcription ?? '(voice note)';
      setChatHistory(prev => [
        ...prev,
        { sender: 'user', text: userText, audio_url: res.data.audio_url ?? null },
      ]);

      // Then the keeper's reply
      setChatHistory(prev => [...prev, { sender: 'keeper', text: res.data.reply }]);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send audio.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Load more ──────────────────────────────────────────── */
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    loadHistory(offset, false);
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="tk-chat-wrap">

      {/* Header */}
      <div style={{ padding: '0.5lh 1ch', borderBottom: '2px solid var(--box-border-color)' }}>
        <pre className="tk-accent" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
{`╔══════════════════════════════════════════╗
║   KEEPER AI INTERFACE — CHAT PROTOCOL    ║
╚══════════════════════════════════════════╝`}
        </pre>
        <p className="tk-dim">&gt; TYPE OR USE VOICE INPUT TO CREATE TASKS</p>
      </div>

      {/* Messages */}
      <div className="tk-chat-messages" ref={messagesContainerRef}>

        {/* Load older */}
        {hasMore && (
          <div style={{ textAlign: 'center', marginBottom: '0.5lh' }}>
            <button
              size-="small"
              variant-="foreground2"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore
                ? <><span is-="spinner" />&nbsp;[LOADING...]</>
                : '[▲ LOAD OLDER MESSAGES]'}
            </button>
          </div>
        )}

        {/* Initial history loading indicator */}
        {historyLoading && (
          <div className="tk-empty">
            <span is-="spinner" />&nbsp;<span className="tk-dim">[LOADING HISTORY...]</span>
          </div>
        )}

        {/* Empty state */}
        {!historyLoading && chatHistory.length === 0 && (
          <div className="tk-empty">
            <p>[SYSTEM READY]</p>
            <p className="tk-dim">AWAITING INPUT...</p>
          </div>
        )}

        {/* Message list */}
        {chatHistory.map((msg, i) => (
          <div key={msg.id ?? i} className="tk-msg">
            <p className={`tk-msg-sender ${msg.sender === 'keeper' ? 'tk-accent' : ''}`}>
              &gt; {msg.sender === 'user' ? 'USER:' : 'KEEPER:'}
            </p>
            <div className={`tk-msg-body ${msg.sender}`}>
              {msg.text}
              {msg.audio_url && <AudioPlayer url={msg.audio_url} />}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="tk-msg">
            <p className="tk-msg-sender tk-accent">&gt; KEEPER:</p>
            <div className="tk-msg-body keeper tk-dim">
              <span is-="spinner" />&nbsp;[PROCESSING...]
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="tk-chat-input-area">

        {error && (
          <div className="tk-banner error">
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="tk-row">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="> Enter command..."
            disabled={loading || isRecording}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            size-="small"
            variant-="accent"
            disabled={loading || isRecording || !message.trim()}
          >
            [SEND]
          </button>
        </form>

        <button
          size-="small"
          variant-={isRecording ? 'danger' : 'foreground0'}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
          className="tk-full"
        >
          {isRecording ? '[ ● RECORDING... CLICK TO STOP ]' : '[ ○ VOICE INPUT ]'}
        </button>

      </div>
    </div>
  );
};

export default Chat;
