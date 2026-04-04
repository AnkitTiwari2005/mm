import React, { useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotContext } from '../contexts/MascotContext';

// ════════════════════════════════════════════
//  MALLOW — KAWAII MASCOT WITH REAL IMAGES ✨
// ════════════════════════════════════════════

const MASCOT_IMAGES = {
  happy: '/mascot/mascot_happy.png',
  excited: '/mascot/mascot_excited.png',
  loving: '/mascot/mascot_loving.png',
  playful: '/mascot/mascot_playful.png',
  proud: '/mascot/mascot_proud.png',
  sad: '/mascot/mascot_sad.png',
  sleepy: '/mascot/mascot_sleepy.png',
  thinking: '/mascot/mascot_thinking.png',
  dramatic: '/mascot/mascot_excited.png',
};

// Animation presets per mood
const MOOD_ANIMATIONS = {
  happy: {
    body: { y: [0, -8, 0], rotate: [-1, 1, -1] },
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(249, 168, 212, 0.3)',
    particles: ['✨', '🌸', '💕'],
  },
  excited: {
    body: { y: [0, -16, 0, -10, 0], rotate: [-3, 3, -3, 2, -2], scale: [1, 1.05, 1, 1.03, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(252, 211, 77, 0.35)',
    particles: ['⭐', '✨', '🎉', '💫'],
  },
  loving: {
    body: { y: [0, -6, 0], scale: [1, 1.03, 1] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(232, 121, 162, 0.4)',
    particles: ['💕', '💗', '💖', '❤️', '♡'],
  },
  playful: {
    body: { y: [0, -10, 0], rotate: [-4, 4, -4], x: [-3, 3, -3] },
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(167, 139, 202, 0.3)',
    particles: ['😜', '✨', '🌟'],
  },
  proud: {
    body: { y: [0, -5, 0], scale: [1, 1.04, 1] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(252, 211, 77, 0.3)',
    particles: ['🏆', '⭐', '✨', '💪'],
  },
  sad: {
    body: { y: [0, 2, 0], rotate: [-1, 0, 1, 0, -1] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(147, 197, 253, 0.25)',
    particles: ['🥺', '💧'],
  },
  sleepy: {
    body: { y: [0, 3, 0], rotate: [-2, 0, 2, 0] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(196, 181, 253, 0.3)',
    particles: ['💤', '😴', '☁️'],
  },
  thinking: {
    body: { y: [0, -4, 0], rotate: [0, 5, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(167, 139, 202, 0.25)',
    particles: ['🤔', '💭', '❓'],
  },
  dramatic: {
    body: { y: [0, -12, 0], scale: [1, 1.08, 1], rotate: [-2, 2, -2] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    glow: 'rgba(232, 121, 162, 0.35)',
    particles: ['😱', '✨', '💫'],
  },
};

// Floating particle component
const FloatingParticle = ({ emoji, delay, anim }) => (
  <motion.span
    initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      y: [-10, -50 - Math.random() * 30],
      x: [0, (Math.random() - 0.5) * 50],
      scale: [0, 1.2, 0],
      rotate: [0, (Math.random() - 0.5) * 60],
    }}
    transition={{ duration: 2 + Math.random(), delay, repeat: anim ? Infinity : 0, repeatDelay: 2 + Math.random() * 3 }}
    className="absolute pointer-events-none z-30"
    style={{ fontSize: 14 + Math.random() * 8, top: '10%', left: `${30 + Math.random() * 40}%` }}
  >
    {emoji}
  </motion.span>
);

const Mascot = ({ size = 120, customEmote, customMessage, showGlow = true, showParticles = true }) => {
  const { currentEmote, currentMessage, isMessageVisible } = useContext(MascotContext);
  const [isBooping, setIsBooping] = useState(false);
  const [sparkles, setSparkles] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({});
  const imgRef = useRef(null);

  const emote = customEmote || currentEmote;
  const message = customMessage !== undefined ? customMessage : currentMessage;
  const mood = MOOD_ANIMATIONS[emote] || MOOD_ANIMATIONS.happy;
  const imgSrc = MASCOT_IMAGES[emote] || MASCOT_IMAGES.happy;

  // Preload all images on mount
  useEffect(() => {
    Object.values(MASCOT_IMAGES).forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => setImgLoaded(prev => ({ ...prev, [src]: true }));
    });
  }, []);

  // Tap handler
  const handleTap = () => {
    setIsBooping(true);
    setSparkles(true);
    setTimeout(() => setIsBooping(false), 800);
    setTimeout(() => setSparkles(false), 1500);
  };

  const boopAnim = {
    y: [0, -25, 0],
    rotate: [0, -12, 12, 0],
    scale: [1, 1.15, 0.95, 1],
  };

  return (
    <div className="relative flex flex-col items-center" onClick={handleTap} style={{ minHeight: size + 20 }}>

      {/* ── Speech Bubble ── */}
      <AnimatePresence>
        {isMessageVisible && message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="absolute z-20 text-center"
            style={{ top: -size * 0.75, minWidth: 160, maxWidth: 240 }}
          >
            <div className="glass-strong rounded-[24px] px-5 py-4 shadow-premium border-2"
              style={{ borderColor: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)' }}>
              <p className="font-quicksand text-[13px] leading-snug font-semibold" style={{ color: '#3D1F5C' }}>
                {message}
              </p>
            </div>
            {/* Tail */}
            <div style={{
              width: 0, height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '12px solid rgba(255,255,255,0.92)',
              margin: '0 auto',
              marginTop: -1,
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tap Sparkle Burst ── */}
      <AnimatePresence>
        {sparkles && [...Array(8)].map((_, i) => (
          <motion.span
            key={`spark-${i}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos((i / 8) * Math.PI * 2) * (35 + Math.random() * 25),
              y: Math.sin((i / 8) * Math.PI * 2) * (35 + Math.random() * 25) - 15,
              opacity: 0,
              scale: [0, 1.5, 0],
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute pointer-events-none z-30"
            style={{ fontSize: 12 + Math.random() * 10, top: '40%', left: '45%' }}
          >
            {mood.particles[i % mood.particles.length]}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* ── Floating Mood Particles ── */}
      {showParticles && mood.particles.slice(0, 3).map((emoji, i) => (
        <FloatingParticle key={`fp-${emote}-${i}`} emoji={emoji} delay={i * 1.5} anim={true} />
      ))}

      {/* ── Mascot Image Body ── */}
      <motion.div
        animate={isBooping ? boopAnim : mood.body}
        transition={isBooping
          ? { duration: 0.6, ease: 'easeInOut' }
          : mood.transition
        }
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
      >
        {/* Glow Aura */}
        {showGlow && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: '-30%',
              background: `radial-gradient(circle, ${mood.glow} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Shadow */}
        <motion.div
          animate={{ scale: isBooping ? [1, 0.7, 1] : [1, 0.9, 1], opacity: [0.15, 0.08, 0.15] }}
          transition={{ duration: isBooping ? 0.6 : 3, repeat: isBooping ? 0 : Infinity, ease: 'easeInOut' }}
          className="absolute pointer-events-none"
          style={{
            bottom: -8,
            left: '15%',
            width: '70%',
            height: 12,
            borderRadius: '50%',
            background: 'rgba(100, 60, 120, 0.15)',
            filter: 'blur(6px)',
          }}
        />

        {/* The Mascot Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={emote}
            ref={imgRef}
            src={imgSrc}
            alt={`Mallow - ${emote}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(232, 121, 162, 0.25))',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            draggable={false}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Mascot;
