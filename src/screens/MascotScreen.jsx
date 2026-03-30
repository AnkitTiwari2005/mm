import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotContext } from '../contexts/MascotContext';
import Mascot from '../components/Mascot';
import BottomNavBar from '../components/BottomNavBar';


const ORBIT_ITEMS = [
  { emoji: '⭐', size: 22 },
  { emoji: '💕', size: 18 },
  { emoji: '✨', size: 20 },
  { emoji: '🌸', size: 22 },
  { emoji: '💫', size: 18 },
  { emoji: '🍬', size: 20 },
];

const ACTION_TABS = [
  { id: 'jokes',      label: 'Jokes',     emoji: '😄', color: '#FCD34D', bg: '#FEF3C7' },
  { id: 'love',       label: 'Love',      emoji: '💕', color: '#E879A2', bg: '#FDF2F8' },
  { id: 'positivity', label: 'Boost',     emoji: '✨', color: '#4ECDC4', bg: '#F0FDFB' },
  { id: 'moods',      label: 'Moods',     emoji: '🎭', color: '#A78BCA', bg: '#F5F3FF' },
];

export default function MascotScreen() {
  const { currentEmote, currentMessage, triggerMessage, triggerRandom } = useContext(MascotContext);
  const [activeTab, setActiveTab] = useState('love');
  const [tapCount, setTapCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Shake detection
  useEffect(() => {
    let lastX = null, lastY = null, lastZ = null;
    const THRESHOLD = 15;
    const handleMotion = (e) => {
      const { accelerationIncludingGravity: acc } = e;
      if (!acc) return;
      if (lastX !== null) {
        const dx = Math.abs(acc.x - lastX);
        const dy = Math.abs(acc.y - lastY);
        const dz = Math.abs(acc.z - lastZ);
        if (dx > THRESHOLD || dy > THRESHOLD || dz > THRESHOLD) {
          triggerMessage('Whoa, shaky!! 🌀 I love the energy!', 'dramatic');
        }
      }
      lastX = acc.x; lastY = acc.y; lastZ = acc.z;
    };
    if (window.DeviceMotionEvent) window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [triggerMessage]);

  // Easter egg on 7 taps
  useEffect(() => {
    if (tapCount >= 7) {
      setShowEasterEgg(true);
      setTapCount(0);
      triggerMessage('You found the secret! 🎉 You deserve all the love!!', 'excited');
      setTimeout(() => setShowEasterEgg(false), 3000);
    }
  }, [tapCount, triggerMessage]);

  const handleMascotTap = () => {
    setTapCount(c => c + 1);
    const randoms = ['playful', 'happy', 'excited', 'loving', 'proud'];
    const messages = ['Boop! 💕', 'Hehe~ ✨', 'Don\'t stop! 🌸', 'Again! 😄', 'I love you! 💗'];
    const idx = Math.floor(Math.random() * randoms.length);
    triggerMessage(messages[idx], randoms[idx]);
  };

  const handleTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'moods') {
      const moods = ['sleepy', 'thinking', 'excited', 'playful', 'dramatic'];
      triggerMessage('Just feeling my feelings right now... ☁️', moods[Math.floor(Math.random() * moods.length)]);
    } else {
      triggerRandom(tabId === 'jokes' ? 'jokes' : tabId === 'love' ? 'loving' : 'motivation');
    }
  };

  const activeTabData = ACTION_TABS.find(t => t.id === activeTab);

  return (
    <main
      className="min-h-screen w-full flex flex-col relative"
      style={{ background: 'linear-gradient(180deg, #F0EBFF 0%, #FFF5FA 100%)' }}
    >
      {/* Animated BG orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(196,181,253,0.35) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], x: [0, -15, 0], y: [0, 25, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-3/4 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(253,207,232,0.3) 0%, transparent 70%)' }}
        />
      </div>

      {/* Easter Egg Burst */}
      <AnimatePresence>
        {showEasterEgg && (
          <div className="fixed inset-0 pointer-events-none z-[200]">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: '50vw', y: '50vh', opacity: 1, scale: 0 }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  opacity: [1, 1, 0],
                  scale: [0, 2, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute text-2xl"
              >
                {['🌟', '💕', '¡', '🎉', '✨'][i % 5]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── SPEECH BUBBLE SECTION ── */}
      <div className="px-6 pt-16 pb-4 flex items-center justify-center relative z-10 min-h-[130px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full max-w-xs rounded-[28px] px-6 py-5 text-center relative"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(30px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
              boxShadow: '0 8px 32px rgba(45,16,64,0.08)',
            }}
          >
            <p className="font-quicksand text-[16px] font-semibold text-on-surface leading-snug italic">
              "{currentMessage || 'Tap me for a little magic! 🌸'}"
            </p>
            <div className="speech-tail" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── MASCOT STAGE ── */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 pb-4">
        {/* Orbiting ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute pointer-events-none"
          style={{ width: 300, height: 300 }}
        >
          {ORBIT_ITEMS.map((item, i) => {
            const angle = (i / ORBIT_ITEMS.length) * 360;
            const radius = 138;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: item.size,
                  opacity: 0.5,
                }}
              >
                <motion.span
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                >
                  {item.emoji}
                </motion.span>
              </div>
            );
          })}
        </motion.div>

        {/* Glow spotlight */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 200, height: 200,
            background: `radial-gradient(circle, ${activeTabData?.bg || '#FDF2F8'}CC 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* Mascot — tappable */}
        <motion.div
          className="z-10 cursor-pointer"
          whileTap={{ scale: 0.88 }}
          onClick={handleMascotTap}
        >
          <Mascot size={240} customEmote={currentEmote} customMessage="" showGlow={true} />
        </motion.div>

        {/* Tap count hint */}
        <motion.p
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-muted mt-4"
        >
          {window.DeviceMotionEvent ? '✨ Tap or shake your phone!' : '✨ Keep tapping Mallow!'}
        </motion.p>

        {/* Secret progress */}
        {tapCount > 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 flex gap-1"
          >
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i < tapCount ? '#E879A2' : 'rgba(232,121,162,0.2)' }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ── ACTION TABS ── */}
      <div className="px-5 z-10 relative" style={{ paddingBottom: 100 }}>
        <div
          className="rounded-[28px] p-2 flex gap-2 items-stretch"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(30px)',
            border: '1.5px solid rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px rgba(45,16,64,0.07)',
          }}
        >
          {ACTION_TABS.map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleTab(tab.id)}
              className="flex-1 flex flex-col items-center py-3 rounded-[20px] transition-all duration-300 gap-1 relative"
              style={{
                background: activeTab === tab.id ? tab.bg : 'transparent',
                boxShadow: activeTab === tab.id ? `0 4px 16px ${tab.color}22` : 'none',
              }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-glow"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ background: tab.color }}
                />
              )}
              <span className="text-[22px]">{tab.emoji}</span>
              <span
                className="font-headline text-[10px] font-black uppercase tracking-wide"
                style={{ color: activeTab === tab.id ? tab.color : '#C4BACB' }}
              >
                {tab.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Floating ambient particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: `${Math.random() * 100}%`, y: '110%', opacity: 0 }}
            animate={{ y: '-10%', opacity: [0, 0.3, 0] }}
            transition={{ duration: 12 + i * 2, delay: i * 1.8, repeat: Infinity, ease: 'linear' }}
            className="absolute text-[14px]"
          >
            {['💜', '🌸', '✨', '💕', '⭐', '🍬', '💫', '🌙'][i]}
          </motion.div>
        ))}
      </div>

      <BottomNavBar />
    </main>
  );
}
