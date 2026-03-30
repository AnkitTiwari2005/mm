import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';


// ✨ PREMIUM FLOATING NAVIGATION BAR
const navItems = [
  { id: 'home',   icon: 'home',       label: 'Home',   path: '/home' },
  { id: 'tasks',  icon: 'checklist',  label: 'Tasks',  path: '/tasks' },
  { id: 'mascot', icon: 'auto_awesome', label: '',     path: '/mascot', center: true },
  { id: 'calendar', icon: 'calendar_month', label: 'Calendar', path: '/calendar' },
  { id: 'files',  icon: 'folder_special', label: 'Files', path: '/files' },
];

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
      {/* 🍬 Floating Nav Pill */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.2 }}
        className="pointer-events-auto w-full max-w-[380px]"
      >
        <div
          className="h-[72px] rounded-[30px] flex items-center justify-around px-3"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 40px rgba(232, 121, 162, 0.14), 0 2px 12px rgba(45, 16, 64, 0.06)',
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.center) {
              return (
                <div key={item.id} className="relative -translate-y-5">
                  {/* Glow ring */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-[-6px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(232,121,162,0.35) 0%, transparent 75%)' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.88, rotate: 20 }}
                    onClick={() => navigate(item.path)}
                    className="w-[60px] h-[60px] rounded-[22px] flex items-center justify-center relative z-10 border-[3px] border-white"
                    style={{
                      background: 'linear-gradient(135deg, #F9A8D4 0%, #E879A2 50%, #BE185D 100%)',
                      boxShadow: '0 8px 28px rgba(232, 121, 162, 0.45), 0 2px 8px rgba(232, 121, 162, 0.2)',
                    }}
                  >
                    <motion.span
                      animate={{ rotate: isActive ? [0, 20, -20, 0] : [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="material-symbols-rounded text-white"
                      style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}
                    >
                      {item.icon}
                    </motion.span>
                  </motion.button>
                </div>
              );
            }

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.90 }}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center h-full px-3 py-2 rounded-[20px] transition-all duration-300"
              >
                {/* Active pill background */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-x-0 inset-y-1 rounded-[18px]"
                      style={{ background: 'rgba(232, 121, 162, 0.1)' }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    />
                  )}
                </AnimatePresence>

                <motion.span
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="material-symbols-rounded relative z-10"
                  style={{
                    fontSize: 24,
                    color: isActive ? '#E879A2' : '#C4BACB',
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    filter: isActive ? 'drop-shadow(0 2px 6px rgba(232,121,162,0.4))' : 'none',
                  }}
                >
                  {item.icon}
                </motion.span>

                {/* Active dot indicator */}
                <motion.div
                  animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="absolute bottom-[10px] w-1 h-1 rounded-full"
                  style={{ background: '#E879A2' }}
                />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default BottomNavBar;
