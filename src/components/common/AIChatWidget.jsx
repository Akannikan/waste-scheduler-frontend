import { useState, useRef, useEffect } from 'react';
import { MdChat, MdClose, MdSend, MdSmartToy } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import client from '../../api/client';

const SUGGESTIONS = [
  'How do I dispose plastic bottles?',
  'When is my next pickup?',
  'Where is the nearest recycling center?',
  'How are waste fees calculated?',
  'What goes in the brown bin?',
];

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`chat-message ${isBot ? 'bot' : 'user'}`}>
      {isBot && (
        <div className="chat-avatar">
          <FaLeaf size={14} />
        </div>
      )}
      <div className="chat-bubble">
        <p>{msg.content}</p>
        <span className="chat-time">
          {new Date(msg.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm WasteBot 👋 Ask me anything about waste disposal, recycling, schedules, or billing in Nigeria!",
      time: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, time: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const { data } = await client.post('/ai/chat', { message: msg, history });

      const botMsg = { role: 'assistant', content: data.message, time: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again shortly.",
        time: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div className={`chat-widget ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-bot-avatar">
              <FaLeaf size={16} />
            </div>
            <div>
              <strong>WasteBot</strong>
              <span className="chat-status">● Online</span>
            </div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)}>
            <MdClose size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && (
            <div className="chat-message bot">
              <div className="chat-avatar"><FaLeaf size={14} /></div>
              <div className="chat-bubble chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.slice(0, 3).map((s, i) => (
              <button key={i} className="chat-suggestion-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask WasteBot anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            maxLength={500}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <MdSend size={18} />
          </button>
        </div>
      </div>

      {/* FAB Button */}
      <button
        className="chat-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Chat"
      >
        {open ? <MdClose size={26} /> : <MdSmartToy size={26} />}
        {!open && unread > 0 && (
          <span className="chat-fab-badge">{unread}</span>
        )}
      </button>
    </>
  );
}
