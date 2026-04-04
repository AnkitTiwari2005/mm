import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import Mascot from '../components/Mascot';

const slides = [
  {
    id: 1,
    title: "Your Cozy Corner",
    desc: "A tiny magical space on your phone, built just for you — away from the noise of the world.",
    emote: "happy",
    mascotMsg: "Hey! I'm Mallow",
    gradient: ['#FF9BC8', '#E879A2', '#BE185D'],
    accent: '#E879A2',
    iconName: 'favorite',
    feature: 'A safe, soft space',
    particles: ['#FFE4F5', '#FDA4AF', '#F9A8D4', '#FBCFE8', '#FDE7F3'],
  },
  {
    id: 2,
    title: "Gentle Reminders",
    desc: "I will make sure you drink water, take breaks, and remember just how amazing you truly are.",
    emote: "loving",
    mascotMsg: "I'll always be here",
    gradient: ['#B794F4', '#A78BCA', '#7C3AED'],
    accent: '#A78BCA',
    iconName: 'notifications_active',
    feature: 'Soft, caring nudges',
    particles: ['#EDE9FE', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F5F3FF'],
  },
  {
    id: 3,
    title: "Organize & Shine",
    desc: "Your tasks, files, and memories — all in one adorable space crafted just for you.",
    emote: "excited",
    mascotMsg: "Let's do this together!",
    gradient: ['#67E8F9', '#38BDF8', '#0284C7'],
    accent: '#38BDF8',
    iconName: 'auto_awesome',
    feature: 'Your personal app',
    particles: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#E0F7FF', '#CFFAFE'],
  },
];

// Floating particle component
const FloatingParticle = ({ colors, index }) => {
  const icons = ['favorite', 'star', 'local_florist', 'auto_awesome', 'diamond', 'spa'];
  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ x: `${10 + index * 15}%`, y: '110%', opacity: 0, rotate: 0 }}
      animate={{ y: '-15%', opacity: [0, 0.7, 0.7, 0], rotate: 360 }}
      transition={{ duration: 12 + index * 2, delay: index * 1.5, repeat: Infinity, ease: 'linear' }}
      style={{ left: `${8 + index * 17}%` }}
    >
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: 32 + index * 4, height: 32 + index * 4, background: colors[index % colors.length] + '88' }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 16 + index * 2, color: 'white' }}>
          {icons[index % icons.length]}
        </span>
      </div>
    </motion.div>
  );
};

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
      style={{ background: '#FFF5FA' }}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(160deg, ${currentSlide.gradient[0]}33 0%, ${currentSlide.gradient[1]}22 50%, ${currentSlide.gradient[2]}15 100%)`,
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ background: '#FFF5FA' }}
      />

      {/* Large gradient orb top */}
      <motion.div
        className="absolute -top-20 -right-20 rounded-full"
        animate={{
          background: `radial-gradient(ellipse, ${currentSlide.gradient[1]}44 0%, transparent 70%)`,
        }}
        transition={{ duration: 0.8 }}
        style={{ width: 300, height: 300 }}
      />

      {/* Large gradient orb bottom-left */}
      <motion.div
        className="absolute -bottom-20 -left-20 rounded-full"
        animate={{
          background: `radial-gradient(ellipse, ${currentSlide.gradient[0]}33 0%, transparent 70%)`,
        }}
        transition={{ duration: 0.8 }}
        style={{ width: 280, height: 280 }}
      />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <FloatingParticle key={i} colors={currentSlide.particles} index={i} />
      ))}

      {/* Skip button */}
      {page < slides.length - 1 && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={skip}
          className="absolute top-14 right-6 z-50 px-5 py-2.5 rounded-full font-headline font-black text-[12px] uppercase tracking-widest"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            color: currentSlide.accent,
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          }}
        >
          Skip
        </motion.button>
      )}

      {/* Progress indicator - top */}
      <div className="absolute top-14 left-6 z-50 flex gap-2 items-center">
        {slides.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: page === i ? 28 : 8,
              background: page === i ? currentSlide.accent : `${currentSlide.accent}44`,
            }}
            className="h-2 rounded-full cursor-pointer"
            onClick={() => go(i)}
          />
        ))}
      </div>

      {/* ── MASCOT AREA - TOP HALF ── */}
      <div className="h-[52%] w-full flex items-end justify-center pb-2 relative z-10 pt-20">
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
            {/* Feature badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-5 px-5 py-2.5 rounded-full flex items-center gap-2.5"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.gradient[0]}22, ${currentSlide.gradient[1]}33)`,
                backdropFilter: 'blur(20px)',
                border: `1.5px solid ${currentSlide.accent}33`,
                boxShadow: `0 4px 20px ${currentSlide.accent}22`,
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: currentSlide.accent }}
              >
                <span className="material-symbols-rounded text-white" style={{ fontSize: 16 }}>
                  {currentSlide.iconName}
                </span>
              </div>
              <span
                className="font-headline font-black text-[13px] tracking-wide"
                style={{ color: currentSlide.accent }}
              >
                {currentSlide.feature}
              </span>
            </motion.div>

            {/* Mascot with glow ring */}
            <div className="relative">
              {/* Pulsing glow ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full -m-4"
                style={{
                  background: `radial-gradient(ellipse, ${currentSlide.accent}33 0%, transparent 70%)`,
                }}
              />
              <Mascot
                size={180}
                customEmote={currentSlide.emote}
                customMessage={currentSlide.mascotMsg}
                showGlow={true}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── CONTENT CARD - BOTTOM HALF ── */}
      <motion.div
        className="flex-1 w-full rounded-t-[48px] flex flex-col z-10 overflow-hidden relative"
        style={{
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 -24px 60px rgba(45,16,64,0.08)',
        }}
        layout
      >
        {/* Handle */}
        <motion.div
          className="w-12 h-1.5 rounded-full mx-auto mt-4 mb-0"
          animate={{ background: currentSlide.accent + '66' }}
        />

        <div className="flex-1 flex flex-col items-center justify-between px-8 py-5">
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
              {/* Slide number */}
              <motion.div
                className="flex justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
              >
                <div
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${currentSlide.gradient[0]}, ${currentSlide.gradient[1]})` }}
                >
                  <span className="material-symbols-rounded text-white" style={{ fontSize: 24 }}>
                    {currentSlide.iconName}
                  </span>
                </div>
              </motion.div>

              <h2 className="font-headline text-[30px] font-black text-on-surface mb-3 leading-tight">
                {currentSlide.title}
              </h2>
              <p className="font-body text-[16px] text-on-surface-variant font-medium leading-relaxed max-w-xs mx-auto">
                {currentSlide.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Bottom controls */}
          <div className="w-full flex flex-col items-center gap-4">
            {/* CTA button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={nextSlide}
              className="w-full h-[62px] rounded-[22px] font-headline font-black text-[18px] text-white tracking-wide relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.gradient[0]}, ${currentSlide.gradient[1]})`,
                boxShadow: `0 8px 32px ${currentSlide.accent}44, 0 2px 8px ${currentSlide.accent}22`,
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              {page === slides.length - 1 ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-rounded" style={{ fontSize: 22 }}>rocket_launch</span>
                  Let's Begin
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Next
                  <span className="material-symbols-rounded" style={{ fontSize: 22 }}>arrow_forward</span>
                </span>
              )}
            </motion.button>

            {/* Dot indicators */}
            <div className="flex gap-2.5 items-center pb-2">
              {slides.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => go(i)}
                  animate={{
                    width: page === i ? 28 : 8,
                    background: page === i ? currentSlide.accent : `${currentSlide.accent}44`,
                  }}
                  className="h-2 rounded-full cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
}
