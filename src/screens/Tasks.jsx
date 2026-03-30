import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskContext } from '../contexts/TaskContext';
import { MascotContext } from '../contexts/MascotContext';
import Mascot from '../components/Mascot';
import BottomNavBar from '../components/BottomNavBar';
import clsx from 'clsx';
import { format, isToday, isAfter, startOfToday } from 'date-fns';

const TABS = [
  { id: 'all',      label: 'All',      emoji: '📋' },
  { id: 'today',    label: 'Today',    emoji: '☀️' },
  { id: 'upcoming', label: 'Later',    emoji: '🔮' },
  { id: 'done',     label: 'Done',     emoji: '✅' },
];

const PRIORITY_STYLES = {
  pink:     { grad: 'linear-gradient(135deg, #FDA4AF, #E879A2)', label: 'Rose',    ring: 'rgba(232,121,162,0.3)' },
  lavender: { grad: 'linear-gradient(135deg, #C4B5FD, #A78BCA)', label: 'Lavender', ring: 'rgba(167,139,202,0.3)' },
  blue:     { grad: 'linear-gradient(135deg, #7DD3FC, #38BDF8)', label: 'Sky',     ring: 'rgba(56,189,248,0.3)' },
};

// Confetti burst component
const ConfettiBlast = ({ active }) => {
  const pieces = ['🌸', '✨', '💕', '⭐', '🎉', '💫', '🎀', '🌟'];
  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[200]">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '50vw', y: '50vh', opacity: 1, scale: 0, rotate: 0 }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                opacity: [1, 1, 0],
                scale: [0, 1.5 + Math.random(), 0],
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.2 + Math.random() * 0.8, ease: 'easeOut' }}
              className="absolute text-[18px]"
            >
              {pieces[i % pieces.length]}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useContext(TaskContext);
  const { triggerRandom, triggerMessage } = useContext(MascotContext);
  const [activeTab, setActiveTab] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    note: '',
    priority: 'pink',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
  });

  const today = startOfToday();

  const filteredAndSortedTasks = useMemo(() => {
    let base = [];
    switch (activeTab) {
      case 'today':    base = tasks.filter(t => !t.completed && isToday(new Date(t.date || today))); break;
      case 'upcoming': base = tasks.filter(t => !t.completed && isAfter(new Date(t.date || today), today) && !isToday(new Date(t.date || today))); break;
      case 'done':     base = tasks.filter(t => t.completed); break;
      default:         base = tasks.filter(t => !t.completed); break;
    }

    return [...base].sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { pink: 0, lavender: 1, blue: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return new Date((a.date || '1970-01-01') + 'T' + (a.time || '00:00')) - new Date((b.date || '1970-01-01') + 'T' + (b.time || '00:00'));
    });
  }, [tasks, activeTab, sortBy, today]);

  const handleToggle = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task?.completed) {
      setShowConfetti(true);
      triggerMessage("YES! Task crushed! You're amazing 🎉", 'excited');
      setTimeout(() => setShowConfetti(false), 2200);
    }
    toggleTask(id);
  };

  const handleAdd = () => {
    if (!newTask.title.trim()) return;
    addTask({ ...newTask });
    setNewTask({ title: '', note: '', priority: 'pink', date: format(new Date(), 'yyyy-MM-dd'), time: '09:00' });
    setIsSheetOpen(false);
    triggerRandom('proud');
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative" style={{ background: '#FFF5FA', paddingBottom: 110 }}>
      {/* Aurora BG */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
      </div>

      <ConfettiBlast active={showConfetti} />

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-2 flex justify-between items-center relative z-10"
      >
        <div>
          <h1 className="font-headline text-[38px] font-black text-on-surface leading-none">Tasks</h1>
          <p className="font-quicksand text-[13px] font-semibold text-on-surface-muted mt-1">
            {filteredAndSortedTasks.length} {activeTab === 'done' ? 'completed' : 'remaining'} ✦
          </p>
        </div>

        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.88, rotate: 15 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-12 h-12 rounded-[18px] flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 16px rgba(232,121,162,0.1)',
            }}
          >
            <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 22 }}>tune</span>
          </motion.button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsFilterOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 top-14 z-[110] w-48 rounded-[24px] overflow-hidden p-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(30px)',
                    border: '1.5px solid rgba(255,255,255,0.95)',
                    boxShadow: '0 12px 40px rgba(45,16,64,0.12)',
                  }}
                >
                  {[
                    { id: 'date', label: 'By Time ⏰' },
                    { id: 'priority', label: 'By Priority 🌸' },
                    { id: 'name', label: 'By Name 🔡' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setSortBy(opt.id); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-[18px] font-headline text-[13px] font-black transition-all"
                      style={{
                        background: sortBy === opt.id ? 'rgba(232,121,162,0.08)' : 'transparent',
                        color: sortBy === opt.id ? '#E879A2' : '#2D1040',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* ── TABS ── */}
      <div className="px-6 mt-4 flex gap-2 overflow-x-auto no-scrollbar relative z-10 pb-1">
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setActiveTab(tab.id)}
            className="shrink-0 px-4 h-10 rounded-full font-headline font-black text-[12px] tracking-wide transition-all flex items-center gap-1.5"
            style={{
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #F9A8D4, #E879A2)'
                : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)',
              color: activeTab === tab.id ? 'white' : '#7C6D85',
              border: activeTab === tab.id ? 'none' : '1.5px solid rgba(232,121,162,0.08)',
              boxShadow: activeTab === tab.id ? '0 4px 16px rgba(232,121,162,0.35)' : '0 2px 8px rgba(45,16,64,0.05)',
            }}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ── TASK LIST ── */}
      <div className="flex-1 px-6 mt-5 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-12 text-center gap-4"
            >
              <Mascot size={120} />
              <div
                className="px-6 py-5 rounded-[24px] max-w-[240px]"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 20px rgba(45,16,64,0.06)',
                }}
              >
                <p className="font-quicksand text-[14px] font-bold italic text-on-surface leading-snug">
                  {activeTab === 'done'
                    ? "Nothing done yet — go get 'em! 💪"
                    : 'Your space is clear. Time to dream? ✨'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-3">
              {filteredAndSortedTasks.map((task, i) => {
                const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.pink;
                return (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 30 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-[24px] overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.88)',
                      backdropFilter: 'blur(20px)',
                      border: '1.5px solid rgba(255,255,255,0.95)',
                      boxShadow: `0 4px 20px rgba(45,16,64,0.05)`,
                    }}
                  >
                    <div className="flex items-center gap-4 p-4 pr-4">
                      {/* Priority bar */}
                      <div className="w-1 h-12 rounded-full shrink-0" style={{ background: ps.grad }} />

                      {/* Check button */}
                      <motion.button
                        whileTap={{ scale: 1.25 }}
                        onClick={() => handleToggle(task.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: task.completed ? ps.grad : 'transparent',
                          border: task.completed ? 'none' : `2px solid rgba(124,109,133,0.2)`,
                          boxShadow: task.completed ? `0 2px 12px ${ps.ring}` : 'none',
                        }}
                      >
                        <AnimatePresence>
                          {task.completed && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="material-symbols-rounded text-white"
                              style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
                            >
                              check
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'font-headline text-[16px] font-black leading-snug truncate transition-all',
                          task.completed ? 'text-on-surface-muted line-through' : 'text-on-surface'
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.date && (
                            <span className="font-quicksand text-[10px] font-bold uppercase tracking-widest text-on-surface-muted">
                              {format(new Date(task.date), 'MMM d')}
                            </span>
                          )}
                          <span
                            className="font-headline text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${PRIORITY_STYLES[task.priority]?.grad || ps.grad})`,
                              color: 'white',
                              opacity: 0.9,
                            }}
                          >
                            {ps.label}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => deleteTask(task.id)}
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(232,121,162,0.08)' }}
                      >
                        <span className="material-symbols-rounded text-primary" style={{ fontSize: 16 }}>close</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FAB ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88, rotate: 90 }}
        onClick={() => setIsSheetOpen(true)}
        className="fixed z-40 flex items-center justify-center"
        style={{
          bottom: 110, right: 24,
          width: 64, height: 64,
          borderRadius: 22,
          background: 'linear-gradient(135deg, #F9A8D4 0%, #E879A2 50%, #BE185D 100%)',
          boxShadow: '0 8px 32px rgba(232,121,162,0.5), 0 2px 8px rgba(232,121,162,0.2)',
          border: '3px solid white',
        }}
      >
        <span className="material-symbols-rounded text-white" style={{ fontSize: 30, fontVariationSettings: "'wght' 700" }}>
          add
        </span>
      </motion.button>

      {/* ── ADD TASK SHEET ── */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(45,16,64,0.25)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-[40px] px-7 pt-5 pb-10 overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 -20px 60px rgba(45,16,64,0.12)',
                maxHeight: '88vh',
              }}
            >
              <div className="w-14 h-1.5 rounded-full mx-auto mb-6 bg-on-surface-muted/30" />
              <h3 className="font-headline text-[26px] font-black text-on-surface text-center mb-6">
                New Task ☁️
              </h3>

              <div className="space-y-4">
                <input
                  autoFocus
                  className="w-full rounded-[18px] px-5 py-4 font-headline text-[17px] font-black text-on-surface outline-none transition-all"
                  style={{
                    background: 'rgba(232,121,162,0.06)',
                    border: '2px solid rgba(232,121,162,0.15)',
                  }}
                  placeholder="What's the task? ✦"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                />

                <textarea
                  className="w-full rounded-[18px] px-5 py-4 font-body text-[15px] text-on-surface outline-none transition-all resize-none min-h-[90px]"
                  style={{
                    background: 'rgba(167,139,202,0.06)',
                    border: '2px solid rgba(167,139,202,0.12)',
                  }}
                  placeholder="Any notes? (optional)"
                  value={newTask.note}
                  onChange={e => setNewTask({ ...newTask, note: e.target.value })}
                />

                <div className="flex gap-3">
                  <input
                    type="date"
                    className="flex-1 rounded-[16px] px-4 py-3 font-body text-[13px] font-bold text-on-surface outline-none"
                    style={{ background: 'rgba(56,189,248,0.06)', border: '2px solid rgba(56,189,248,0.12)' }}
                    value={newTask.date}
                    onChange={e => setNewTask({ ...newTask, date: e.target.value })}
                  />
                  <input
                    type="time"
                    className="flex-1 rounded-[16px] px-4 py-3 font-body text-[13px] font-bold text-on-surface outline-none"
                    style={{ background: 'rgba(56,189,248,0.06)', border: '2px solid rgba(56,189,248,0.12)' }}
                    value={newTask.time}
                    onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                  />
                </div>

                {/* Priority selector */}
                <div>
                  <p className="font-headline text-[11px] font-black uppercase tracking-widest text-on-surface-muted mb-3">
                    Priority Color
                  </p>
                  <div className="flex gap-3 justify-center">
                    {Object.entries(PRIORITY_STYLES).map(([key, s]) => (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewTask({ ...newTask, priority: key })}
                        className="w-14 h-14 rounded-[18px] flex items-center justify-center transition-all"
                        style={{
                          background: s.grad,
                          border: newTask.priority === key ? '3px solid white' : '3px solid transparent',
                          boxShadow: newTask.priority === key ? `0 4px 16px ${s.ring}, 0 0 0 3px ${s.ring}` : 'none',
                          transform: newTask.priority === key ? 'scale(1.12)' : 'scale(1)',
                        }}
                      >
                        {newTask.priority === key && (
                          <span className="material-symbols-rounded text-white" style={{ fontSize: 18 }}>check</span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAdd}
                  disabled={!newTask.title.trim()}
                  className="w-full h-[58px] rounded-[20px] font-headline font-black text-[17px] text-white tracking-wide transition-all"
                  style={{
                    background: newTask.title.trim()
                      ? 'linear-gradient(135deg, #F9A8D4 0%, #E879A2 50%, #BE185D 100%)'
                      : 'rgba(196,186,203,0.3)',
                    boxShadow: newTask.title.trim() ? '0 8px 28px rgba(232,121,162,0.4)' : 'none',
                    color: newTask.title.trim() ? 'white' : '#C4BACB',
                  }}
                >
                  Save Task 🌸
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNavBar />
    </main>
  );
}
