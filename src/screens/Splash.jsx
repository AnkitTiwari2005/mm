import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import Mascot from '../components/Mascot';

// ✨ Floating particle
const Particle = ({ delay, x, emoji, size }) => (
  <motion.div
    initial={{ y: '110vh', x, opacity: 0, rotate: 0 }}
    animate={{ y: '-10vh', opacity: [0, 0.7, 0.7, 0], rotate: Math.random() > 0.5 ? 360 : -360 }}
    transition={{ duration: 8 + Math.random() * 5, delay, repeat: Infinity, ease: 'linear' }}
    className="fixed pointer-events-none z-0"
    style={{ fontSize: size || 16 }}
  >
    {emoji}
  </motion.div>
);

export default function Splash() {
  const navigate = useNavigate();
  const { userName, onboardingComplete } = useContext(UserContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userName && onboardingComplete) {
        navigate('/home', { replace: true });
      } else if (onboardingComplete) {
        navigate('/name-entry', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate, userName, onboardingComplete]);

  const particles = [
    { delay: 0,   x: '10vw',  emoji: '🌸', size: 20 },
    { delay: 1,   x: '25vw',  emoji: '✨', size: 14 },
    { delay: 0.5, x: '70vw',  emoji: '💕', size: 16 },
    { delay: 1.5, x: '85vw',  emoji: '🌸', size: 12 },
    { delay: 2,   x: '45vw',  emoji: '⭐', size: 14 },
    { delay: 0.8, x: '55vw',  emoji: '💫', size: 18 },
    { delay: 2.5, x: '15vw',  emoji: '🍬', size: 16 },
    { delay: 3,   x: '90vw',  emoji: '🌙', size: 13 },
  ];

  return (
    <main className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      {/* Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>

      {/* Floating Particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center justify-center text-center px-8 w-full gap-8"
      >
        {/* Mascot with burst entrance */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
        >
          <Mascot size={160} customEmote="happy" customMessage="" showGlow={true} />
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl"
            >🍬</motion.span>
            <h1
              className="font-headline text-[44px] font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #BE185D 0%, #E879A2 50%, #F9A8D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Marshmallow
            </h1>
            <motion.span
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="text-3xl"
            >✨</motion.span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="font-quicksand text-[15px] font-semibold text-on-surface-variant"
          >
            made with love, just for you 💕
          </motion.p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex gap-2 items-center"
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full"
              style={{ background: 'linear-gradient(135deg, #E879A2, #A78BCA)' }}
            />
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
