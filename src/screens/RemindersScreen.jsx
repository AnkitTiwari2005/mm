import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReminderContext } from '../contexts/ReminderContext';
import BottomNavBar from '../components/BottomNavBar';
import { useNavigate } from 'react-router-dom';


const ICONS = [
  { id: 'water_drop',    emoji: '💧', label: 'Water' },
  { id: 'menu_book',     emoji: '📖', label: 'Read' },
  { id: 'self_improvement', emoji: '🧘', label: 'Meditate' },
  { id: 'task_alt',      emoji: '✅', label: 'Task' },
  { id: 'nights_stay',   emoji: '🌙', label: 'Sleep' },
  { id: 'restaurant',    emoji: '🍽️', label: 'Eat' },
  { id: 'favorite',      emoji: '💕', label: 'Self-love' },
  { id: 'spa',           emoji: '🌿', label: 'Relax' },
  { id: 'fitness_center',emoji: '🏋️', label: 'Move' },
  { id: 'cloud',         emoji: '☁️', label: 'Breathe' },
];

const ICON_COLORS = [
  '#7DD3FC', '#FDA4AF', '#86EFAC', '#FCD34D', '#C4B5FD',
  '#F9A8D4', '#6EE7B7', '#A5F3FC', '#FCA5A5', '#DDD6FE',
];

export default function RemindersScreen() {
  const navigate = useNavigate();
  const { reminders, toggleReminder, addReminder } = useContext(ReminderContext);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newSchedule, setNewSchedule] = useState('');
  const [newIcon, setNewIcon] = useState(ICONS[0]);
  const [newEnabled, setNewEnabled] = useState(true);

  const handleSave = () => {
    if (!newText.trim() || !newSchedule.trim()) return;
    addReminder({ text: newText, schedule: newSchedule, icon: newIcon.id, enabled: newEnabled });
    setSheetOpen(false);
    setNewText(''); setNewSchedule(''); setNewIcon(ICONS[0]); setNewEnabled(true);
  };

  const getIconEmoji = (iconId) => ICONS.find(i => i.id === iconId)?.emoji || '🔔';

  return (
    <main className="min-h-screen w-full flex flex-col relative" style={{ background: '#FFF5FA', paddingBottom: 110 }}>
      {/* Aurora BG */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" style={{ background: 'radial-gradient(ellipse, rgba(167,139,202,0.25) 0%, transparent 70%)' }} />
        <div className="aurora-orb-2" />
      </div>

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-2 flex items-center gap-3 relative z-10"
      >
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/home')}
          className="w-11 h-11 rounded-[16px] flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 16px rgba(45,16,64,0.06)',
          }}
        >
          <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 20 }}>arrow_back</span>
        </motion.button>

        <div className="flex-1">
          <h1 className="font-headline text-[30px] font-black text-on-surface leading-none">Reminders</h1>
          <p className="font-quicksand text-[12px] font-semibold text-on-surface-muted">
            Gentle nudges, just for you 🌸
          </p>
        </div>
      </motion.header>

      {/* ── REMINDERS LIST ── */}
      <div className="flex-1 px-5 mt-5 overflow-y-auto no-scrollbar space-y-3 relative z-10">
        <AnimatePresence>
          {reminders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-16 text-center gap-3"
            >
              <span className="text-5xl">🔔</span>
              <p className="font-headline text-[18px] font-black text-on-surface">No reminders yet</p>
              <p className="font-quicksand text-[14px] font-semibold text-on-surface-muted max-w-xs">
                Add some gentle nudges to take care of yourself 💕
              </p>
            </motion.div>
          )}
          {reminders.map((reminder, i) => {
            const colorBg = ICON_COLORS[i % ICON_COLORS.length];
            const iconEmoji = getIconEmoji(reminder.icon);
            return (
              <motion.div
                key={reminder.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-[24px] overflow-hidden"
                style={{
                  background: reminder.enabled
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(255,255,255,0.95)',
                  boxShadow: reminder.enabled
                    ? '0 4px 20px rgba(45,16,64,0.05)'
                    : '0 2px 8px rgba(45,16,64,0.03)',
                  opacity: reminder.enabled ? 1 : 0.65,
                }}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon bubble */}
                  <div
                    className="w-12 h-12 rounded-[16px] flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${colorBg}33` }}
                  >
                    {iconEmoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-[15px] font-black text-on-surface truncate">
                      {reminder.text}
                    </p>
                    <p className="font-quicksand text-[11px] font-bold text-on-surface-muted mt-0.5 uppercase tracking-wider">
                      {reminder.schedule}
                    </p>
                  </div>

                  {/* Toggle */}
                  <motion.button
                    onClick={() => toggleReminder(reminder.id)}
                    className="relative shrink-0"
                    style={{
                      width: 52, height: 30,
                      borderRadius: 15,
                      background: reminder.enabled
                        ? 'linear-gradient(135deg, #F9A8D4, #E879A2)'
                        : 'rgba(196,186,203,0.3)',
                      boxShadow: reminder.enabled ? '0 2px 12px rgba(232,121,162,0.4)' : 'none',
                      padding: 3,
                    }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <motion.div
                      animate={{ x: reminder.enabled ? 22 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-6 h-6 rounded-full bg-white"
                      style={{ boxShadow: '0 2px 8px rgba(45,16,64,0.15)' }}
                    />
                  </motion.button>
                </div>

                {/* Colored bottom stripe when enabled */}
                {reminder.enabled && (
                  <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${colorBg}88, transparent)` }} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── FAB ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => setSheetOpen(true)}
        className="fixed flex items-center gap-2 z-40"
        style={{
          bottom: 110, right: 20,
          height: 56,
          paddingInline: 20,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #C4B5FD, #A78BCA)',
          boxShadow: '0 8px 28px rgba(167,139,202,0.5)',
          border: '2.5px solid white',
        }}
      >
        <span className="material-symbols-rounded text-white" style={{ fontSize: 22 }}>add_alert</span>
        <span className="font-headline font-black text-[13px] text-white uppercase tracking-wide">New Nudge</span>
      </motion.button>

      {/* ── ADD SHEET ── */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(45,16,64,0.2)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-[36px] px-6 pt-4 pb-10 overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 -20px 60px rgba(45,16,64,0.1)',
                maxHeight: '88vh',
              }}
            >
              <div className="w-14 h-1.5 rounded-full mx-auto mb-5" style={{ background: 'rgba(196,186,203,0.4)' }} />
              <h3 className="font-headline text-[24px] font-black text-on-surface mb-5">New Gentle Nudge 🌸</h3>

              <div className="space-y-4">
                {/* Text */}
                <div>
                  <label className="font-headline text-[11px] font-black uppercase tracking-widest text-on-surface-muted mb-2 block">
                    Message
                  </label>
                  <input
                    type="text" autoFocus
                    value={newText} onChange={e => setNewText(e.target.value)}
                    placeholder="e.g. Drink some water 💧"
                    className="w-full rounded-[16px] px-4 py-3.5 font-body text-[15px] font-semibold text-on-surface outline-none"
                    style={{ background: 'rgba(167,139,202,0.08)', border: '2px solid rgba(167,139,202,0.15)' }}
                  />
                </div>

                {/* Schedule */}
                <div>
                  <label className="font-headline text-[11px] font-black uppercase tracking-widest text-on-surface-muted mb-2 block">
                    When
                  </label>
                  <input
                    type="text"
                    value={newSchedule} onChange={e => setNewSchedule(e.target.value)}
                    placeholder="e.g. Every 2 hours"
                    className="w-full rounded-[16px] px-4 py-3.5 font-body text-[15px] font-semibold text-on-surface outline-none"
                    style={{ background: 'rgba(232,121,162,0.06)', border: '2px solid rgba(232,121,162,0.12)' }}
                  />
                </div>

                {/* Icon picker */}
                <div>
                  <label className="font-headline text-[11px] font-black uppercase tracking-widest text-on-surface-muted mb-2 block">
                    Icon
                  </label>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                    {ICONS.map((icon, idx) => (
                      <motion.button
                        key={icon.id}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setNewIcon(icon)}
                        className="shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center text-xl transition-all"
                        style={{
                          background: newIcon.id === icon.id ? `${ICON_COLORS[idx % ICON_COLORS.length]}33` : 'rgba(196,186,203,0.1)',
                          border: newIcon.id === icon.id ? `2px solid ${ICON_COLORS[idx % ICON_COLORS.length]}` : '2px solid transparent',
                          transform: newIcon.id === icon.id ? 'scale(1.12)' : 'scale(1)',
                        }}
                      >
                        {icon.emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Enable toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-headline text-[14px] font-black text-on-surface">Enable immediately</p>
                    <p className="font-quicksand text-[12px] font-semibold text-on-surface-muted">Start right away</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setNewEnabled(!newEnabled)}
                    style={{
                      width: 52, height: 30, borderRadius: 15,
                      background: newEnabled ? 'linear-gradient(135deg, #F9A8D4, #E879A2)' : 'rgba(196,186,203,0.3)',
                      boxShadow: newEnabled ? '0 2px 12px rgba(232,121,162,0.35)' : 'none',
                      padding: 3,
                    }}
                    className="relative"
                  >
                    <motion.div
                      animate={{ x: newEnabled ? 22 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-6 h-6 rounded-full bg-white"
                      style={{ boxShadow: '0 2px 8px rgba(45,16,64,0.15)' }}
                    />
                  </motion.button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave}
                  disabled={!newText.trim() || !newSchedule.trim()}
                  className="w-full h-[56px] rounded-[20px] font-headline font-black text-[16px] transition-all"
                  style={{
                    background: (newText.trim() && newSchedule.trim())
                      ? 'linear-gradient(135deg, #C4B5FD, #A78BCA)'
                      : 'rgba(196,186,203,0.3)',
                    color: (newText.trim() && newSchedule.trim()) ? 'white' : '#C4BACB',
                    boxShadow: (newText.trim() && newSchedule.trim()) ? '0 8px 28px rgba(167,139,202,0.4)' : 'none',
                  }}
                >
                  Set Gentle Nudge ✨
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
