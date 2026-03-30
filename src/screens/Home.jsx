import React, { useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import { TaskContext } from '../contexts/TaskContext';
import { FileContext } from '../contexts/FileContext';
import { MascotContext } from '../contexts/MascotContext';
import Mascot from '../components/Mascot';
import BottomNavBar from '../components/BottomNavBar';
import { useNavigate } from 'react-router-dom';
import { isToday, startOfToday, format } from 'date-fns';

// Priority color map
const PRIORITY_COLORS = {
  pink:     { from: '#F9A8D4', to: '#E879A2', text: '#BE185D' },
  lavender: { from: '#C4B5FD', to: '#A78BCA', text: '#5B21B6' },
  blue:     { from: '#7DD3FC', to: '#38BDF8', text: '#0369A1' },
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return { text: 'Hey night owl', emoji: '🌙' };
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  if (h < 21) return { text: 'Good evening', emoji: '🌅' };
  return { text: 'Good night', emoji: '⭐' };
};

export default function Home() {
  const { userName, profilePic } = useContext(UserContext);
  const { tasks } = useContext(TaskContext);
  const { folders } = useContext(FileContext);
  const { triggerRandom } = useContext(MascotContext);
  const navigate = useNavigate();
  const greeting = getGreeting();

  const todayTasks = useMemo(() => {
    const today = startOfToday();
    return tasks.filter(t => !t.completed && isToday(new Date(t.date || today)));
  }, [tasks]);

  const completedToday = useMemo(() => tasks.filter(t => t.completed && isToday(new Date(t.date || startOfToday()))).length, [tasks]);
  const recentFolders = useMemo(() => folders.slice(0, 4), [folders]);

  const folderColors = ['#FBCFE8', '#DDD6FE', '#BAE6FD', '#BBF7D0', '#FDE68A', '#FECACA'];

  return (
    <main
      className="min-h-screen w-full flex flex-col overflow-x-hidden relative"
      style={{ paddingBottom: 120, background: '#FFF5FA' }}
    >
      {/* Aurora BG */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-14 pb-2 flex justify-between items-start relative z-10"
      >
        <div className="flex flex-col">
          <span className="font-quicksand text-[13px] font-semibold text-on-surface-variant flex items-center gap-1.5">
            <span>{greeting.emoji}</span>
            <span>{greeting.text},</span>
          </span>
          <h1 className="font-headline text-[36px] font-black text-on-surface leading-tight mt-0.5">
            {userName || 'Sunshine'} 🌸
          </h1>
        </div>

        <motion.button
          whileTap={{ scale: 0.88, rotate: -10 }}
          onClick={() => navigate('/profile')}
          className="mt-1 w-12 h-12 rounded-[18px] flex items-center justify-center relative"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.95)',
            boxShadow: '0 4px 20px rgba(232,121,162,0.12)',
          }}
        >
          <img
            src={profilePic || `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${userName || 'marshmallow'}&backgroundColor=FFF5FA`}
            className="w-full h-full rounded-[16px] object-cover scale-110"
            alt="avatar"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
            style={{ background: 'linear-gradient(135deg, #E879A2, #BE185D)' }}
          >
            <span style={{ color: 'white' }}>✦</span>
          </motion.div>
        </motion.button>
      </motion.header>

      {/* ── STATS STRIP ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 mt-4 flex gap-3 relative z-10"
      >
        {[
          { label: 'Tasks Today', value: todayTasks.length, icon: '📋', color: '#E879A2' },
          { label: 'Done Today', value: completedToday, icon: '✅', color: '#4ECDC4' },
          { label: 'Spaces', value: folders.length, icon: '📁', color: '#A78BCA' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="flex-1 rounded-[20px] p-3 text-center"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.9)',
              boxShadow: '0 2px 12px rgba(45,16,64,0.05)',
            }}
          >
            <div className="text-xl mb-0.5">{stat.icon}</div>
            <div className="font-headline text-[22px] font-black" style={{ color: stat.color }}>{stat.value}</div>
            <div className="font-quicksand text-[9px] font-bold text-on-surface-muted uppercase tracking-wide">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── MASCOT STAGE ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 24 }}
        className="mx-6 mt-5 relative z-10"
      >
        <motion.div
          className="rounded-[36px] p-8 flex flex-col items-center cursor-pointer relative"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(30px)',
            border: '1.5px solid rgba(255,255,255,0.95)',
            boxShadow: '0 8px 40px rgba(232,121,162,0.10), 0 2px 8px rgba(45,16,64,0.04)',
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => triggerRandom('loving')}
        >
          {/* Clean interior layer for background graphics */}
          <div className="absolute inset-0 rounded-[36px] overflow-hidden pointer-events-none">
            {/* Sparkle floaters */}
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  y: [-10, -60 - i * 10],
                  opacity: [0, 0.7, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 15],
                  scale: [0.5, 1, 0],
                }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                className="absolute pointer-events-none text-[16px]"
                style={{ bottom: '40%', left: `${15 + i * 16}%` }}
              >
                {['✨', '💕', '🌸', '⭐', '💫'][i]}
              </motion.span>
            ))}

            {/* Bg gradient orb */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 100%, rgba(251,207,232,0.3) 0%, transparent 70%)',
              }}
            />
          </div>

          <div className="relative">
            <Mascot size={150} showGlow={true} />
          </div>

          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#E879A2' }}
                />
              ))}
            </div>
            <p className="font-quicksand text-[10px] font-bold text-on-surface-muted uppercase tracking-[0.25em]">
              Tap Mallow to chat ✨
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── TODAY'S TASKS ── */}
      <section className="mt-7 relative z-10">
        <div className="px-6 flex justify-between items-center mb-4">
          <h2 className="font-headline text-[20px] font-black text-on-surface">Today's Focus</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="font-headline text-[11px] font-black uppercase tracking-widest"
            style={{ color: '#E879A2' }}
          >
            See All →
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
          {todayTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full min-h-[90px] rounded-[24px] flex items-center justify-center"
              style={{
                border: '2px dashed rgba(232,121,162,0.2)',
                background: 'rgba(255,255,255,0.5)',
              }}
            >
              <p className="font-quicksand text-[14px] font-bold italic" style={{ color: 'rgba(232,121,162,0.4)' }}>
                All clear for now ✨
              </p>
            </motion.div>
          ) : (
            todayTasks.map((task, i) => {
              const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.pink;
              return (
                <motion.button
                  key={task.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/tasks')}
                  className="shrink-0 min-w-[180px] h-[95px] rounded-[24px] p-4 flex flex-col justify-between text-left"
                  style={{
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(255,255,255,0.95)',
                    boxShadow: `0 4px 20px ${colors.to}22`,
                  }}
                >
                  {/* Priority stripe */}
                  <div className="w-8 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` }} />
                  <span className="font-headline text-[15px] font-black text-on-surface leading-snug truncate">
                    {task.title}
                  </span>
                  <span className="font-quicksand text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text }}>
                    {format(new Date(task.date || new Date()), 'MMM d')}
                  </span>
                </motion.button>
              );
            })
          )}
        </div>
      </section>

      {/* ── YOUR SPACES ── */}
      <section className="mt-7 px-6 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline text-[20px] font-black text-on-surface">Your Spaces</h2>
          <button
            onClick={() => navigate('/files')}
            className="font-headline text-[11px] font-black uppercase tracking-widest"
            style={{ color: '#A78BCA' }}
          >
            Organize →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {recentFolders.length === 0 ? (
            <motion.div
              className="col-span-2 h-[100px] rounded-[24px] flex items-center justify-center gap-3"
              style={{ background: 'rgba(232,121,162,0.05)', border: '2px dashed rgba(232,121,162,0.15)' }}
            >
              <span className="text-2xl">📁</span>
              <p className="font-quicksand text-[13px] font-bold" style={{ color: 'rgba(232,121,162,0.4)' }}>
                Tap Files to create spaces
              </p>
            </motion.div>
          ) : (
            recentFolders.map((folder, i) => (
              <motion.button
                key={folder.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => navigate(`/folder/${folder.id}`)}
                className="rounded-[24px] p-5 flex flex-col items-center gap-3 min-h-[120px] justify-center"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 20px rgba(45,16,64,0.05)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center text-xl"
                  style={{ background: folderColors[i % folderColors.length] }}
                >
                  📁
                </div>
                <span className="font-headline text-[13px] font-black text-on-surface text-center leading-tight">
                  {folder.name}
                </span>
              </motion.button>
            ))
          )}
        </div>
      </section>

      {/* ── QUICK ACTIONS ── */}
      <section className="mt-7 px-6 relative z-10">
        <h2 className="font-headline text-[20px] font-black text-on-surface mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          {[
            { label: 'Add Task', icon: '✅', path: '/tasks', color: '#E879A2', bg: '#FDF2F8' },
            { label: 'Reminders', icon: '🔔', path: '/reminders', color: '#A78BCA', bg: '#F5F3FF' },
            { label: 'Mascot', icon: '🍬', path: '/mascot', color: '#38BDF8', bg: '#F0F9FF' },
          ].map((a, i) => (
            <motion.button
              key={a.label}
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate(a.path)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="flex-1 rounded-[20px] py-4 flex flex-col items-center gap-2"
              style={{
                background: a.bg,
                border: `1.5px solid ${a.color}22`,
              }}
            >
              <span className="text-xl">{a.icon}</span>
              <span className="font-headline text-[11px] font-black uppercase tracking-wide" style={{ color: a.color }}>
                {a.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <BottomNavBar />
    </main>
  );
}
