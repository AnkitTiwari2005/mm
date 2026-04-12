import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import { chatWithMallow } from '../utils/openrouter';
import { sendMessage, subscribeToMessages } from '../utils/firebase';
import BottomNavBar from '../components/BottomNavBar';

// ════════════════════════════════════════════
//  CHAT SCREEN — Mallow AI + Our Space 💬
// ════════════════════════════════════════════

// Cherry blossom (sakura) SVG icon for the Mallow tab 🌸
const MallowIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 5 petals */}
    <ellipse cx="32" cy="14" rx="9" ry="14" fill="url(#petal-g)" transform="rotate(0 32 32)" />
    <ellipse cx="32" cy="14" rx="9" ry="14" fill="url(#petal-g)" transform="rotate(72 32 32)" />
    <ellipse cx="32" cy="14" rx="9" ry="14" fill="url(#petal-g)" transform="rotate(144 32 32)" />
    <ellipse cx="32" cy="14" rx="9" ry="14" fill="url(#petal-g)" transform="rotate(216 32 32)" />
    <ellipse cx="32" cy="14" rx="9" ry="14" fill="url(#petal-g)" transform="rotate(288 32 32)" />
    {/* Center */}
    <circle cx="32" cy="32" r="6" fill="#FCD34D" />
    <circle cx="30" cy="30" r="1.5" fill="#F59E0B" opacity="0.6" />
    <circle cx="34" cy="31" r="1" fill="#F59E0B" opacity="0.5" />
    <circle cx="31" cy="34" r="1.2" fill="#F59E0B" opacity="0.5" />
    <defs>
      <linearGradient id="petal-g" x1="32" y1="0" x2="32" y2="28">
        <stop offset="0%" stopColor="#FBCFE8" />
        <stop offset="100%" stopColor="#F9A8D4" />
      </linearGradient>
    </defs>
  </svg>
);

// Heart SVG icon for the header
const HeartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#heart-grad)" />
    <defs><linearGradient id="heart-grad" x1="2" y1="3" x2="22" y2="21"><stop offset="0%" stopColor="#F9A8D4" /><stop offset="100%" stopColor="#E879A2" /></linearGradient></defs>
  </svg>
);

const LS_MALLOW_HISTORY = 'marshmallow_chat_mallow';

export default function ChatScreen() {
  const { userName } = useContext(UserContext);
  const [mode, setMode] = useState('mallow'); // 'mallow' | 'shared'
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const dummyRef = useRef(null);

  // ── Mallow Chat State ──
  const [mallowMessages, setMallowMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_MALLOW_HISTORY)) || [];
    } catch { return []; }
  });

  // ── Shared Chat State ──
  const [sharedMessages, setSharedMessages] = useState([]);
  const [lastMsgCount, setLastMsgCount] = useState(0);

  // Save Mallow history to localStorage
  useEffect(() => {
    localStorage.setItem(LS_MALLOW_HISTORY, JSON.stringify(mallowMessages.slice(-50)));
  }, [mallowMessages]);

  // Subscribe to Firebase shared messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages((msgs) => {
      // Notify on new messages from partner
      if (mode === 'shared' && msgs.length > lastMsgCount && lastMsgCount > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.sender !== userName) {
          // Vibrate
          if (navigator.vibrate) navigator.vibrate(100);
        }
      }
      setSharedMessages(msgs);
      setLastMsgCount(msgs.length);
    });
    return () => unsubscribe?.();
  }, [userName, mode, lastMsgCount]);

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => {
      dummyRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [mallowMessages, sharedMessages, mode, isTyping]);

  // ── Send Message ──
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (mode === 'mallow') {
      const userMsg = { role: 'user', content: text, timestamp: Date.now() };
      const updated = [...mallowMessages, userMsg];
      setMallowMessages(updated);
      setIsTyping(true);

      const reply = await chatWithMallow(text, mallowMessages);
      const assistantMsg = { role: 'assistant', content: reply, timestamp: Date.now() };
      setMallowMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    } else {
      // Send to Firebase
      await sendMessage(text, userName || 'You');
    }
  }, [input, mode, mallowMessages, userName]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeMessages = mode === 'mallow' ? mallowMessages : sharedMessages;

  const clearMallowChat = () => {
    setMallowMessages([]);
    localStorage.removeItem(LS_MALLOW_HISTORY);
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative" style={{ background: '#FFF5FA' }}>
      {/* Aurora BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full"
          style={{ background: mode === 'mallow'
            ? 'radial-gradient(ellipse, rgba(196,181,253,0.25) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(253,207,232,0.3) 0%, transparent 70%)'
          }} />
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(186,230,253,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* ── HEADER ── */}
      <div className="fixed top-0 left-0 right-0 z-40" style={{
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(232,121,162,0.1)',
      }}>
        <div className="px-4 pt-3 pb-2">
          {/* Title */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {mode === 'mallow' ? <HeartIcon size={24} /> : <span className="text-xl">💕</span>}
              <h1 className="font-headline text-[18px] font-extrabold text-on-surface">
                {mode === 'mallow' ? 'Mallow' : 'Our Space'}
              </h1>
              {mode === 'mallow' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                  background: 'linear-gradient(135deg, #4ECDC4, #38BDF8)',
                  color: 'white',
                }}>AI</span>
              )}
            </div>
            {mode === 'mallow' && mallowMessages.length > 0 && (
              <button onClick={clearMallowChat}
                className="text-[11px] font-bold text-on-surface-muted px-2 py-1 rounded-xl"
                style={{ background: 'rgba(232,121,162,0.08)' }}>
                Clear
              </button>
            )}
          </div>

          {/* Toggle Switch */}
          <div className="flex rounded-[16px] p-1 gap-1" style={{
            background: 'rgba(45,16,64,0.04)', border: '1px solid rgba(232,121,162,0.08)',
          }}>
            {[
              { id: 'mallow', label: 'Mallow', icon: 'mallow', color: '#A78BCA' },
              { id: 'shared', label: 'Our Space', color: '#E879A2' },
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setMode(tab.id)}
                className="flex-1 py-2 rounded-[12px] font-headline text-[13px] font-extrabold transition-all relative"
                style={{
                  color: mode === tab.id ? 'white' : '#C4BACB',
                  background: mode === tab.id
                    ? `linear-gradient(135deg, ${tab.color}, ${tab.color}DD)`
                    : 'transparent',
                  boxShadow: mode === tab.id ? `0 4px 16px ${tab.color}33` : 'none',
                }}
              >
                <span className="flex items-center gap-1.5 justify-center">
                  {tab.icon === 'mallow'
                    ? <MallowIcon size={16} />
                    : <span>💕</span>
                  }
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-[130px] pb-[170px] z-10 no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Empty state */}
        {activeMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 opacity-60">
            {mode === 'mallow' ? <MallowIcon size={64} /> : <span className="text-5xl">💕</span>}
            <p className="font-quicksand text-[14px] text-on-surface-muted text-center font-semibold max-w-[200px]">
              {mode === 'mallow'
                ? "Say hi to Mallow! I'll reply with all the love 💕"
                : "Your private space together. Send the first message! 💌"
              }
            </p>
          </div>
        )}

        {/* Message bubbles with day separators */}
        {activeMessages.map((msg, i) => {
          const isMe = mode === 'mallow'
            ? msg.role === 'user'
            : msg.sender === userName;
          const text = mode === 'mallow' ? msg.content : msg.text;
          const senderLabel = mode === 'shared' && !isMe ? msg.sender : null;

          // Day separator logic
          const msgDate = msg.timestamp ? new Date(msg.timestamp) : null;
          const prevMsg = i > 0 ? activeMessages[i - 1] : null;
          const prevDate = prevMsg?.timestamp ? new Date(prevMsg.timestamp) : null;
          const showDaySep = msgDate && (!prevDate ||
            msgDate.toDateString() !== prevDate.toDateString());

          return (
            <React.Fragment key={msg.id || i}>
              {showDaySep && (
                <div className="flex items-center justify-center my-4">
                  <div className="px-4 py-1.5 rounded-full font-quicksand text-[10px] font-bold text-on-surface-muted uppercase tracking-widest"
                    style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(232,121,162,0.08)' }}>
                    {formatDateLabel(msgDate)}
                  </div>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[80%]">
                  {senderLabel && (
                    <p className="text-[10px] font-bold text-on-surface-muted mb-0.5 px-3">{senderLabel}</p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-[20px] ${
                      isMe ? 'rounded-br-[6px]' : 'rounded-bl-[6px]'
                    }`}
                    style={isMe ? {
                      background: 'linear-gradient(135deg, #F9A8D4, #E879A2)',
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(232,121,162,0.2)',
                    } : {
                      background: 'rgba(255,255,255,0.9)',
                      border: '1px solid rgba(232,121,162,0.1)',
                      color: '#2D1040',
                      boxShadow: '0 2px 8px rgba(45,16,64,0.04)',
                    }}
                  >
                    <p className="font-body text-[14px] leading-relaxed whitespace-pre-wrap">{text}</p>
                  </div>
                  <p className={`text-[9px] mt-0.5 px-3 text-on-surface-muted ${isMe ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp ? formatTime(msg.timestamp) : ''}
                  </p>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && mode === 'mallow' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex justify-start mb-2"
            >
              <div className="px-5 py-3 rounded-[20px] rounded-bl-[6px]"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(232,121,162,0.1)',
                }}>
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: '#E879A2' }}
                    />
                  ))}
                  <span className="text-[11px] ml-1 text-on-surface-muted font-semibold">Mallow is typing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dummy div for auto-scroll */}
        <div ref={dummyRef} style={{ height: 1 }} />
      </div>

      {/* ── INPUT BAR ── */}
      <div className="fixed left-0 right-0 z-30" style={{ bottom: 80 }}>
        <div className="px-3 pb-2">
          <div className="flex items-end gap-2 p-2 rounded-[24px]" style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(40px)',
            border: '1.5px solid rgba(232,121,162,0.12)',
            boxShadow: '0 8px 32px rgba(45,16,64,0.08)',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'mallow' ? 'Talk to Mallow... 💗' : 'Send a message... 💕'}
              rows={1}
              className="flex-1 bg-transparent font-body text-[14px] text-on-surface px-3 py-2 resize-none outline-none placeholder:text-on-surface-muted"
              style={{ maxHeight: 100, minHeight: 38, lineHeight: '1.4' }}
            />
            <motion.button
              whileTap={{ scale: 0.85, rotate: -15 }}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all"
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg, #F9A8D4, #E879A2)'
                  : 'rgba(232,121,162,0.15)',
                opacity: input.trim() ? 1 : 0.5,
                boxShadow: input.trim() ? '0 4px 16px rgba(232,121,162,0.3)' : 'none',
              }}
            >
              <span className="material-symbols-rounded text-white" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </main>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function formatDateLabel(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today - msgDay;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
