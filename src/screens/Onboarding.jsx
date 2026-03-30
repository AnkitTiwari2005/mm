import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import Mascot from '../components/Mascot';

const slides = [
  {
    id: 1,
    emoji: '☁️',
    title: "Your Cozy Corner",
    desc: "A tiny magical space on your phone, built just for you — away from the noise of the world.",
    emote: "happy",
    mascotMsg: "Hey! I'm Mallow 🍬",
    bgFrom: '#FFF0EB',
    bgTo: '#FFE4F5',
    accent: '#E879A2',
    cardBg: '#FFFBFE',
    feature: { icon: '🌸', text: 'A safe, soft space' },
  },
  {
    id: 2,
    emoji: '💧',
    title: "Gentle Reminders",
    desc: "I'll make sure you drink water, take breaks, and remember just how amazing you truly are.",
    emote: "loving",
    mascotMsg: "I'll always be here 💕",
    bgFrom: '#F0EBFF',
    bgTo: '#E4F5FF',
    accent: '#A78BCA',
    cardBg: '#FFFBFE',
    feature: { icon: '🔔', text: 'Soft, caring nudges' },
  },
  {
    id: 3,
    emoji: '💕',
    title: "Always Here For You",
    desc: "Need to organize your thoughts, or just want to hear a joke? Your little companion is ready!",
    emote: "excited",
    mascotMsg: "Let's go! Ready! 🌟",
    bgFrom: '#FFF8EB',
    bgTo: '#FFF0EB',
    accent: '#FCD34D',
    cardBg: '#FFFBFE',
    feature: { icon: '🎀', text: 'Your personal app' },
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setOnboardingComplete } = useContext(UserContext);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const currentSlide = slides[page];

  const go = (next) => {
    setDirection(next > page ? 1 : -1);
    setPage(next);
  };

  const nextSlide = () => {
    if (page < slides.length - 1) {
      go(page + 1);
    } else {
      setOnboardingComplete(true);
      navigate('/name-entry', { replace: true });
    }
  };

  const skip = () => {
    setOnboardingComplete(true);
    navigate('/name-entry', { replace: true });
  };

  return (
    <motion.main
      className="relative h-[100dvh] w-full flex flex-col overflow-hidden"
      animate={{ backgroundColor: currentSlide.bgFrom }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Dynamic gradient BG */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: `linear-gradient(160deg, ${currentSlide.bgFrom} 0%, ${currentSlide.bgTo} 100%)`
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Floating deco particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none text-2xl"
          initial={{ x: `${10 + i * 15}%`, y: '110%', opacity: 0 }}
          animate={{ y: '-10%', opacity: [0, 0.5, 0] }}
          transition={{ duration: 10 + i * 2, delay: i * 1.2, repeat: Infinity, ease: 'linear' }}
        >
          {['🌸', '✨', '💕', '⭐', '🍬', '💫'][i]}
        </motion.div>
      ))}

      {/* Skip button */}
      {page < slides.length - 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={skip}
          className="absolute top-12 right-6 z-50 px-5 py-2.5 font-label text-[12px] font-black uppercase tracking-widest rounded-full"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            color: currentSlide.accent,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          Skip →
        </motion.button>
      )}

      {/* Mascot area — TOP HALF */}
      <div className="h-[46%] w-full flex items-end justify-center pb-4 relative z-10 pt-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={{ x: direction * 80, opacity: 0, scale: 0.85 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -direction * 80, opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="flex flex-col items-center"
          >
            {/* Feature badge above mascot */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4 px-4 py-2 rounded-full font-bold text-[12px] flex items-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                color: currentSlide.accent,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              }}
            >
              <span>{currentSlide.feature.icon}</span>
              <span className="font-headline tracking-wide">{currentSlide.feature.text}</span>
            </motion.div>

            <Mascot
              size={170}
              customEmote={currentSlide.emote}
              customMessage={currentSlide.mascotMsg}
              showGlow={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Card — BOTTOM HALF */}
      <motion.div
        className="flex-1 w-full rounded-t-[44px] flex flex-col z-10 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 -20px 60px rgba(45,16,64,0.08)',
        }}
        layout
      >
        {/* Drag indicator */}
        <div className="w-16 h-1.5 rounded-full mx-auto mt-4 mb-0 opacity-20" style={{ background: currentSlide.accent }} />

        <div className="flex-1 flex flex-col items-center justify-between px-8 py-6">
          {/* Text content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
              className="text-center w-full"
            >
              <div className="text-4xl mb-4">{currentSlide.emoji}</div>
              <h2 className="font-headline text-[30px] font-black text-on-surface mb-4 leading-tight">
                {currentSlide.title}
              </h2>
              <p className="font-body text-[16px] text-on-surface-variant font-medium leading-relaxed max-w-xs mx-auto">
                {currentSlide.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bottom controls */}
          <div className="w-full flex flex-col items-center gap-6">
            {/* Progress dots */}
            <div className="flex gap-2.5 items-center">
              {slides.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => go(i)}
                  animate={{
                    width: page === i ? 28 : 8,
                    background: page === i ? currentSlide.accent : '#EDE9F2',
                  }}
                  className="h-2 rounded-full cursor-pointer"
                />
              ))}
            </div>

            {/* CTA button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={nextSlide}
              className="w-full h-[60px] rounded-[20px] font-headline font-black text-[17px] text-white tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.accent}CC 0%, ${currentSlide.accent} 100%)`,
                boxShadow: `0 8px 28px ${currentSlide.accent}44`,
              }}
            >
              {page === slides.length - 1 ? "Let's Begin 🌌" : "Next ✨"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
}
