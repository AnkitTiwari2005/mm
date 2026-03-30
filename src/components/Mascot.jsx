import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotContext } from '../contexts/MascotContext';

// ════════════════════════════════════════════
//  ULTRA PREMIUM KAWAII MASCOT — MALLOW ✨
// ════════════════════════════════════════════
const Mascot = ({ size = 120, customEmote, customMessage, showGlow = true }) => {
  const { currentEmote, currentMessage, isMessageVisible } = useContext(MascotContext);
  const [isBooping, setIsBooping] = useState(false);
  const [blinkPhase, setBlinkPhase] = useState(false);
  const [sparkleVisible, setSparkleVisible] = useState(false);

  const emote = customEmote || currentEmote;
  const message = customMessage !== undefined ? customMessage : currentMessage;

  // Blinking
  useEffect(() => {
    const blink = () => {
      setBlinkPhase(true);
      setTimeout(() => setBlinkPhase(false), 200);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Sparkle on tap
  const handleTap = () => {
    setIsBooping(true);
    setSparkleVisible(true);
    setTimeout(() => setIsBooping(false), 800);
    setTimeout(() => setSparkleVisible(false), 1200);
  };

  // ── Eye Definitions ──
  const eyeScaleY = blinkPhase ? 0.05 : 1;

  const eyes = {
    happy: (
      <g transform={`translate(50, 48)`} style={{ transformOrigin: '0 0' }}>
        {/* Left eye - happy arc */}
        <g transform="translate(-19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <path d="M-6,4 Q0,-2 6,4" fill="none" stroke="#3D1F5C" strokeWidth="2.8" strokeLinecap="round"/>
            <circle cx="-3" cy="2" r="1" fill="white" opacity="0.8"/>
          </motion.g>
        </g>
        {/* Right eye */}
        <g transform="translate(19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <path d="M-6,4 Q0,-2 6,4" fill="none" stroke="#3D1F5C" strokeWidth="2.8" strokeLinecap="round"/>
            <circle cx="3" cy="2" r="1" fill="white" opacity="0.8"/>
          </motion.g>
        </g>
      </g>
    ),
    excited: (
      <g transform="translate(50, 48)">
        <g transform="translate(-19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <circle cx="0" cy="2" r="5.5" fill="#3D1F5C"/>
            <circle cx="2" cy="0" r="2" fill="white"/>
            <circle cx="-2" cy="3" r="1" fill="white" opacity="0.6"/>
          </motion.g>
        </g>
        <g transform="translate(19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <circle cx="0" cy="2" r="5.5" fill="#3D1F5C"/>
            <circle cx="2" cy="0" r="2" fill="white"/>
            <circle cx="-2" cy="3" r="1" fill="white" opacity="0.6"/>
          </motion.g>
        </g>
      </g>
    ),
    sleepy: (
      <g transform="translate(50, 50)">
        <g transform="translate(-19, 0)">
          <path d="M-6,0 Q0,6 6,0" fill="none" stroke="#3D1F5C" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Zz */}
          <text x="8" y="-8" fontSize="8" fill="#A78BCA" fontWeight="bold" fontFamily="Nunito">z</text>
        </g>
        <g transform="translate(19, 0)">
          <path d="M-6,0 Q0,6 6,0" fill="none" stroke="#3D1F5C" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
      </g>
    ),
    loving: (
      <g transform="translate(50, 48)">
        <g transform="translate(-19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <path d="M-6,5 Q0,-3 6,5" fill="none" stroke="#E879A2" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="-2" cy="3" r="1.2" fill="#FDE8F5" opacity="0.9"/>
          </motion.g>
        </g>
        <g transform="translate(19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <path d="M-6,5 Q0,-3 6,5" fill="none" stroke="#E879A2" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="2" cy="3" r="1.2" fill="#FDE8F5" opacity="0.9"/>
          </motion.g>
        </g>
      </g>
    ),
    playful: (
      <g transform="translate(50, 48)">
        <g transform="translate(-19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <circle cx="0" cy="3" r="4.5" fill="#3D1F5C"/>
            <circle cx="1.5" cy="1" r="1.8" fill="white"/>
          </motion.g>
        </g>
        <g transform="translate(19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <path d="M-5,4 Q0,-2 5,4" fill="none" stroke="#3D1F5C" strokeWidth="2.8" strokeLinecap="round"/>
          </motion.g>
        </g>
      </g>
    ),
    thinking: (
      <g transform="translate(50, 47)">
        <g transform="translate(-19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <circle cx="0" cy="3" r="4" fill="#3D1F5C"/>
            <circle cx="1" cy="1" r="1.5" fill="white"/>
          </motion.g>
        </g>
        <g transform="translate(19, 2)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <circle cx="0" cy="3" r="4" fill="#3D1F5C"/>
            <circle cx="1" cy="1" r="1.5" fill="white"/>
          </motion.g>
        </g>
      </g>
    ),
    proud: (
      <g transform="translate(50, 48)">
        <g transform="translate(-19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <path d="M-6,5 Q0,-4 6,5" fill="none" stroke="#3D1F5C" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="0" cy="1" r="1.2" fill="#3D1F5C"/>
          </motion.g>
        </g>
        <g transform="translate(19, 0)">
          <motion.g animate={{ scaleY: eyeScaleY }} style={{ transformOrigin: '0 3px' }}>
            <path d="M-6,5 Q0,-4 6,5" fill="none" stroke="#3D1F5C" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="0" cy="1" r="1.2" fill="#3D1F5C"/>
          </motion.g>
        </g>
      </g>
    ),
    dramatic: (
      <g transform="translate(50, 47)">
        <g transform="translate(-19, 0)">
          <circle cx="0" cy="3" r="6" fill="#3D1F5C"/>
          <circle cx="2" cy="0" r="2.5" fill="white"/>
        </g>
        <g transform="translate(19, 0)">
          <circle cx="0" cy="3" r="6" fill="#3D1F5C"/>
          <circle cx="2" cy="0" r="2.5" fill="white"/>
        </g>
      </g>
    ),
  };

  // ── Mouth Definitions ──
  const mouths = {
    happy: (
      <g transform="translate(50, 70)">
        <path d="M-10,0 Q0,10 10,0" fill="none" stroke="#3D1F5C" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    ),
    excited: (
      <g transform="translate(50, 70)">
        <ellipse cx="0" cy="3" rx="7" ry="6" fill="#3D1F5C"/>
        <path d="M-5,3 Q0,9 5,3" fill="#E879A2" opacity="0.5"/>
      </g>
    ),
    sleepy: (
      <g transform="translate(50, 72)">
        <path d="M-4,0 Q0,3 4,0" fill="none" stroke="#3D1F5C" strokeWidth="2" strokeLinecap="round"/>
      </g>
    ),
    loving: (
      <g transform="translate(50, 69)">
        <path d="M-10,0 Q-4,8 0,2 Q4,8 10,0" fill="#E879A2" opacity="0.8"/>
      </g>
    ),
    playful: (
      <g transform="translate(50, 69)">
        <path d="M-9,0 Q0,10 9,0" fill="none" stroke="#3D1F5C" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="6" cy="3" r="3" fill="#FDA4AF" opacity="0.6"/>
      </g>
    ),
    thinking: (
      <g transform="translate(50, 73)">
        <path d="M-6,0 L6,0" stroke="#3D1F5C" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="9" cy="-2" r="1.5" fill="#A78BCA"/>
        <circle cx="13" cy="-6" r="1" fill="#A78BCA"/>
      </g>
    ),
    proud: (
      <g transform="translate(50, 70)">
        <path d="M-8,2 Q0,-2 8,2" fill="none" stroke="#3D1F5C" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    ),
    dramatic: (
      <g transform="translate(50, 70)">
        <ellipse cx="0" cy="4" rx="5" ry="7" fill="#3D1F5C"/>
      </g>
    ),
  };

  const blushOpacity = (emote === 'loving' || emote === 'excited') ? 0.7 : 
                       (emote === 'happy' || emote === 'playful') ? 0.45 : 0.3;

  return (
    <div className="relative flex flex-col items-center" onClick={handleTap}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {isMessageVisible && message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute z-20 text-center"
            style={{ top: -90, minWidth: 150, maxWidth: 220 }}
          >
            <div className="glass-strong rounded-[24px] px-5 py-4 shadow-premium border-2 border-white">
              <p className="font-quicksand text-[13px] leading-snug font-semibold text-on-surface">
                {message}
              </p>
            </div>
            <div className="speech-tail" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap Sparkles */}
      <AnimatePresence>
        {sparkleVisible && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos((i / 6) * Math.PI * 2) * (30 + Math.random() * 20),
              y: Math.sin((i / 6) * Math.PI * 2) * (30 + Math.random() * 20) - 20,
              opacity: 0,
              scale: [0, 1.5, 0],
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute pointer-events-none z-30 text-primary"
            style={{ fontSize: 12 + Math.random() * 8 }}
          >
            {i % 2 === 0 ? '✨' : '💕'}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Mascot Body */}
      <motion.div
        animate={{
          y: isBooping ? [0, -20, 0] : [0, -8, 0],
          rotate: isBooping ? [0, -10, 10, 0] : [-0.5, 0.5, -0.5],
          scale: isBooping ? [1, 1.1, 1] : 1,
        }}
        transition={isBooping
          ? { duration: 0.6, ease: 'easeInOut' }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative cursor-pointer"
        style={{ width: size, height: size * 1.25 }}
      >
        {/* Glow */}
        {showGlow && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-[-20%] rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${
                emote === 'loving' ? 'rgba(232, 121, 162, 0.25)' :
                emote === 'excited' ? 'rgba(252, 211, 77, 0.2)' :
                emote === 'sleepy' ? 'rgba(167, 139, 202, 0.2)' :
                'rgba(232, 121, 162, 0.18)'
              } 0%, transparent 75%)`,
            }}
          />
        )}

        {/* SVG Mascot */}
        <svg
          width={size}
          height={size * 1.25}
          viewBox="0 0 100 125"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`body-${emote}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor={
                emote === 'loving' ? '#FFE4F5' :
                emote === 'excited' ? '#FFF3E0' :
                emote === 'sleepy' ? '#F0EBFF' :
                '#FFF0F7'
              } />
            </linearGradient>
            <linearGradient id="blushGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="100%" stopColor="#F9A8D4" />
            </linearGradient>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(232,121,162,0.15)" />
            </filter>
          </defs>

          {/* Ear Left */}
          <ellipse cx="28" cy="12" rx="9" ry="11" fill={`url(#body-${emote})`} stroke="white" strokeWidth="1.5"/>
          <ellipse cx="28" cy="13" rx="5" ry="7" fill="#FDA4AF" opacity="0.5"/>

          {/* Ear Right */}
          <ellipse cx="72" cy="12" rx="9" ry="11" fill={`url(#body-${emote})`} stroke="white" strokeWidth="1.5"/>
          <ellipse cx="72" cy="13" rx="5" ry="7" fill="#FDA4AF" opacity="0.5"/>

          {/* Left Arm */}
          <motion.path
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            d="M18,65 Q5,68 5,78 Q5,88 16,88"
            stroke={`url(#body-${emote})`}
            strokeWidth="13"
            strokeLinecap="round"
            style={{ transformOrigin: '18px 65px' }}
          />
          <motion.path
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            d="M18,65 Q5,68 5,78 Q5,88 16,88"
            stroke="white"
            strokeWidth="11"
            strokeLinecap="round"
            opacity="0.6"
            style={{ transformOrigin: '18px 65px' }}
          />

          {/* Right Arm */}
          <motion.path
            animate={{ rotate: [8, -8, 8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            d="M82,65 Q95,68 95,78 Q95,88 84,88"
            stroke={`url(#body-${emote})`}
            strokeWidth="13"
            strokeLinecap="round"
            style={{ transformOrigin: '82px 65px' }}
          />
          <motion.path
            animate={{ rotate: [8, -8, 8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            d="M82,65 Q95,68 95,78 Q95,88 84,88"
            stroke="white"
            strokeWidth="11"
            strokeLinecap="round"
            opacity="0.6"
            style={{ transformOrigin: '82px 65px' }}
          />

          {/* Main Body */}
          <path
            d="M22,22 C22,22 50,14 78,22 C90,25 93,38 93,56 L93,88 C93,106 90,116 78,119 C50,125 22,119 22,119 C10,116 7,106 7,88 L7,56 C7,38 10,25 22,22Z"
            fill={`url(#body-${emote})`}
            stroke="white"
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />

          {/* Body Shine */}
          <path
            d="M38,25 Q42,20 55,22 Q58,23 56,28 Q50,31 42,30 Q36,29 38,25Z"
            fill="white"
            opacity="0.6"
          />

          {/* Blush Cheeks */}
          <motion.ellipse
            animate={{ opacity: blushOpacity }}
            cx="22" cy="68" rx="9" ry="7"
            fill="url(#blushGrad)"
            style={{ filter: 'blur(3px)' }}
          />
          <motion.ellipse
            animate={{ opacity: blushOpacity }}
            cx="78" cy="68" rx="9" ry="7"
            fill="url(#blushGrad)"
            style={{ filter: 'blur(3px)' }}
          />

          {/* Eyes */}
          {eyes[emote] || eyes.happy}

          {/* Mouth */}
          {mouths[emote] || mouths.happy}

          {/* Loving hearts decoration */}
          {emote === 'loving' && (
            <>
              <motion.text
                x="80" y="35"
                fontSize="10"
                animate={{ y: [35, 15, 35], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
              >💕</motion.text>
              <motion.text
                x="8" y="40"
                fontSize="8"
                animate={{ y: [40, 20, 40], opacity: [0, 1, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
              >♡</motion.text>
            </>
          )}

          {/* Sleepy ZZz */}
          {emote === 'sleepy' && (
            <>
              <motion.text
                x="78" y="30" fontSize="10" fill="#A78BCA" fontFamily="Nunito" fontWeight="bold"
                animate={{ y: [30, 15], opacity: [0, 0.8, 0], x: [78, 85] }}
                transition={{ duration: 2, repeat: Infinity }}
              >z</motion.text>
              <motion.text
                x="83" y="20" fontSize="7" fill="#C4B5FD" fontFamily="Nunito" fontWeight="bold"
                animate={{ y: [20, 8], opacity: [0, 0.7, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >z</motion.text>
            </>
          )}

          {/* Excited star eyes */}
          {emote === 'excited' && (
            <>
              <motion.text x="27" y="35" fontSize="8"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >✨</motion.text>
              <motion.text x="60" y="35" fontSize="8"
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              >✨</motion.text>
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
};

export default Mascot;
