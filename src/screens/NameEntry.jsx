import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import Mascot from '../components/Mascot';

export default function NameEntry() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { setUserName } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setIsSubmitting(true);
    setUserName(inputValue.trim());
    setTimeout(() => navigate('/home', { replace: true }), 900);
  };

  const isReady = inputValue.trim().length > 0;

  return (
    <main className="relative h-[100dvh] w-full flex flex-col items-center overflow-hidden">
      {/* Aurora BG */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>

      {/* Top section with mascot */}
      <div className="flex-1 w-full flex flex-col items-center justify-end pb-6 pt-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSubmitting ? 'submitting' : 'idle'}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <Mascot
              size={160}
              customEmote={isSubmitting ? 'excited' : isFocused ? 'loving' : 'happy'}
              customMessage={
                isSubmitting
                  ? `So lovely to meet you, ${inputValue}! 🌸`
                  : isFocused
                  ? "I love that name already 💕"
                  : "What should I call you, sunshine? ✨"
              }
              showGlow={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom card */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.2 }}
        className="w-full px-6 pb-10 flex flex-col gap-5 relative z-10"
        style={{ maxWidth: 440, margin: '0 auto' }}
      >
        {/* Label */}
        <div className="text-center">
          <h1 className="font-headline text-[28px] font-black text-on-surface leading-tight">
            What's your name?
          </h1>
          <p className="font-quicksand text-[14px] text-on-surface-variant font-semibold mt-1">
            I'll use it to make everything feel more personal 💕
          </p>
        </div>

        {/* Input */}
        <div className="relative">
          {/* Glow layer */}
          <motion.div
            animate={{
              opacity: isFocused ? 1 : 0,
              scale: isFocused ? 1 : 0.95,
            }}
            className="absolute -inset-2 rounded-[28px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(232,121,162,0.15) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
          <motion.input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isSubmitting}
            onKeyDown={(e) => e.key === 'Enter' && isReady && handleSubmit()}
            placeholder="Your name..."
            className="w-full text-center font-headline text-[26px] font-black outline-none relative z-10 transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(30px)',
              border: isFocused ? '2px solid rgba(232,121,162,0.5)' : '2px solid rgba(232,121,162,0.1)',
              borderRadius: 24,
              padding: '18px 24px',
              color: '#2D1040',
              boxShadow: isFocused
                ? '0 0 0 4px rgba(232,121,162,0.12), 0 8px 32px rgba(232,121,162,0.12)'
                : '0 4px 20px rgba(45,16,64,0.06)',
            }}
          />
        </div>

        {/* Submit button */}
        <motion.button
          whileTap={isReady && !isSubmitting ? { scale: 0.96 } : {}}
          onClick={handleSubmit}
          disabled={!isReady || isSubmitting}
          animate={{
            scale: isReady ? [1, 1.01, 1] : 1,
          }}
          transition={{ repeat: isReady ? Infinity : 0, duration: 2, ease: 'easeInOut' }}
          className="w-full h-[62px] rounded-[22px] font-headline font-black text-[18px] tracking-wide transition-all duration-400"
          style={{
            background: isReady
              ? 'linear-gradient(135deg, #F9A8D4 0%, #E879A2 50%, #BE185D 100%)'
              : 'rgba(196, 186, 203, 0.3)',
            color: isReady ? 'white' : '#C4BACB',
            boxShadow: isReady ? '0 8px 32px rgba(232,121,162,0.4)' : 'none',
            cursor: isReady ? 'pointer' : 'not-allowed',
          }}
        >
          {isSubmitting ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >⭐</motion.span>
          ) : (
            "That's me! 🌸"
          )}
        </motion.button>

        {/* Hint */}
        <AnimatePresence>
          {isReady && !isSubmitting && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center font-quicksand text-[13px] font-semibold"
              style={{ color: '#C4BACB' }}
            >
              press Enter or tap the button ☝️
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
