import React, { useContext, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskContext } from '../contexts/TaskContext';
import { MascotContext } from '../contexts/MascotContext';
import BottomNavBar from '../components/BottomNavBar';
import clsx from 'clsx';
import { schedulePlanNotifications } from '../utils/notifications';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, startOfToday,
} from 'date-fns';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const STICKERS = ['🌸', '✨', '🎬', '✈️', '🎂', '🍽️', '💕', '🛍️', '🎓'];

const MONTH_COLORS = [
  '#FDA4AF', '#F9A8D4', '#C4B5FD', '#A5B4FC', '#7DD3FC',
  '#6EE7B7', '#FCD34D', '#FCA5A5', '#DDD6FE', '#BAE6FD', '#A3E635', '#FDBA74',
];

export default function Calendar() {
  const { tasks, addTask } = useContext(TaskContext);
  const { triggerRandom } = useContext(MascotContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNote, setNewTaskNote] = useState('');
  const [selectedSticker, setSelectedSticker] = useState('✨');
  const today = startOfToday();

  const monthColor = MONTH_COLORS[currentDate.getMonth()];

  const calendarDays = useMemo(() => {
    const start = view === 'month' ? startOfWeek(startOfMonth(currentDate)) : startOfWeek(currentDate);
    const end   = view === 'month' ? endOfWeek(endOfMonth(currentDate))   : endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate, view]);

  const selectedDateTasks = useMemo(() =>
    tasks.filter(t => isSameDay(new Date(t.date || today), selectedDate)),
    [tasks, selectedDate, today]
  );

  const handleQuickAdd = () => {
    if (!newTaskTitle.trim()) return;
    const plan = { 
      id: Date.now().toString(), 
      title: newTaskTitle.trim(), 
      note: newTaskNote.trim(),
      date: format(selectedDate, 'yyyy-MM-dd'), 
      priority: 'pink', 
      completed: false,
      sticker: selectedSticker,
      isCalendarPlan: true,
    };
    addTask(plan);
    schedulePlanNotifications(plan);
    setNewTaskTitle('');
    setNewTaskNote('');
    setSelectedSticker('✨');
    setIsQuickAddOpen(false);
    triggerRandom('proud');
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative" style={{ background: '#FFF5FA', paddingBottom: 110 }}>
      {/* Aurora BG */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
      </div>

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-2 relative z-10"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-headline text-[38px] font-black text-on-surface leading-none">Calendar</h1>
            <p className="font-quicksand text-[13px] font-semibold text-on-surface-muted mt-1">
              {format(currentDate, 'MMMM yyyy')} ✦
            </p>
          </div>

          {/* View toggle */}
          <div
            className="flex mt-2 rounded-[16px] p-1 gap-1"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.9)',
            }}
          >
            {['month', 'week'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-2 rounded-[12px] font-headline text-[11px] font-black uppercase tracking-wide transition-all"
                style={{
                  background: view === v ? `linear-gradient(135deg, ${monthColor}CC, ${monthColor})` : 'transparent',
                  color: view === v ? 'white' : '#7C6D85',
                  boxShadow: view === v ? `0 3px 12px ${monthColor}55` : 'none',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mt-5">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))}
            className="w-10 h-10 rounded-[14px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,0.9)' }}
          >
            <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 20 }}>chevron_left</span>
          </motion.button>

          <button onClick={() => setCurrentDate(new Date())}>
            <motion.div
              className="px-5 py-2 rounded-full font-headline font-black text-[13px]"
              style={{
                background: `${monthColor}22`,
                color: monthColor,
                border: `1.5px solid ${monthColor}44`,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Today
            </motion.div>
          </button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))}
            className="w-10 h-10 rounded-[14px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,0.9)' }}
          >
            <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 20 }}>chevron_right</span>
          </motion.button>
        </div>
      </motion.header>

      {/* ── DAY LABELS ── */}
      <div className="px-6 mt-5 grid grid-cols-7 relative z-10">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center font-headline text-[11px] font-black text-on-surface-muted uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── CALENDAR GRID ── */}
      <div className="px-4 mt-2 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentDate.getMonth()}-${view}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-7 gap-y-1"
          >
            {calendarDays.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate);
              const isT = isSameDay(day, today);
              const inMonth = isSameMonth(day, currentDate);
              const dayTasks = tasks.filter(t => isSameDay(new Date(t.date || today), day));
              const dayHasTasks = dayTasks.length > 0;
              const firstSticker = dayTasks.find(t => t.sticker)?.sticker;

              return (
                <div key={i} className="flex justify-center py-1">
                  <motion.button
                    whileTap={{ scale: 0.82 }}
                    onClick={() => setSelectedDate(day)}
                    className="w-10 h-10 rounded-[14px] flex flex-col items-center justify-center relative transition-all"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${monthColor}CC, ${monthColor})`
                        : isT ? `${monthColor}18` : 'transparent',
                      opacity: inMonth ? 1 : 0.25,
                      boxShadow: isSelected ? `0 4px 16px ${monthColor}55` : 'none',
                    }}
                  >
                    <span
                      className="font-headline text-[15px] font-black leading-none"
                      style={{ color: isSelected ? 'white' : isT ? monthColor : '#2D1040' }}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Sticker/Emoji display */}
                    {firstSticker && (
                      <div className="absolute -top-1 -right-1 text-[13px] z-[5]">
                        {firstSticker}
                      </div>
                    )}
                    
                    {/* Task dot */}
                    {dayHasTasks && (
                      <div
                        className="absolute bottom-1 w-1 h-1 rounded-full"
                        style={{
                          background: isSelected ? 'white' : monthColor,
                          opacity: isSelected ? 0.8 : 1,
                        }}
                      />
                    )}
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── SELECTED DAY AGENDA ── */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 24 }}
        className="mx-5 mt-5 rounded-[28px] flex-1 relative z-10 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(30px)',
          border: '1.5px solid rgba(255,255,255,0.95)',
          boxShadow: '0 8px 36px rgba(45,16,64,0.07)',
        }}
      >
        {/* Agenda header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-headline text-[20px] font-black text-on-surface">{format(selectedDate, 'EEEE')}</h3>
            <p className="font-quicksand text-[11px] font-bold text-on-surface-muted uppercase tracking-widest">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] font-headline font-black text-[11px] uppercase tracking-wide"
            style={{
              background: `${monthColor}15`,
              color: monthColor,
              border: `1.5px solid ${monthColor}22`,
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
            Plan
          </motion.button>
        </div>

        {/* Task list */}
        <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: 200 }}>
          <AnimatePresence>
            {selectedDateTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-6 text-center gap-2"
              >
                <span className="text-3xl">🌸</span>
                <p className="font-quicksand text-[13px] font-bold italic text-on-surface-muted">
                  No plans for this day.<br />Make some magic? ✨
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {selectedDateTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-[16px]"
                    style={{ background: task.completed ? 'rgba(78,205,196,0.08)' : `${monthColor}0C` }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background: task.priority === 'pink' ? '#E879A2'
                          : task.priority === 'lavender' ? '#A78BCA' : '#38BDF8',
                      }}
                    />
                    {task.sticker && <span className="text-xl leading-none">{task.sticker}</span>}
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        'font-headline text-[14px] font-black truncate',
                        task.completed ? 'line-through text-on-surface-muted' : 'text-on-surface'
                      )}>
                        {task.title}
                      </p>
                      {task.note && (
                        <p className="font-quicksand text-[11px] font-semibold text-on-surface-muted leading-tight mt-0.5 line-clamp-2">
                          {task.note}
                        </p>
                      )}
                    </div>
                    {task.completed && (
                      <span className="material-symbols-rounded shrink-0" style={{ fontSize: 16, color: '#4ECDC4' }}>check_circle</span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── QUICK ADD MODAL ── */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsQuickAddOpen(false)}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(45,16,64,0.2)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[70] rounded-[30px] p-6"
              style={{
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 20px 60px rgba(45,16,64,0.15)',
              }}
            >
              <h3 className="font-headline text-[22px] font-black text-on-surface text-center mb-4">
                Plan for {format(selectedDate, 'MMM d')}
                <span className="ml-2 material-symbols-rounded align-middle" style={{ fontSize: 22, color: monthColor }}>edit_calendar</span>
              </h3>
              <input
                autoFocus
                className="w-full rounded-[16px] px-4 py-3.5 font-headline text-[16px] font-black text-on-surface outline-none mb-3"
                style={{ background: `${monthColor}10`, border: `2px solid ${monthColor}22` }}
                placeholder="What's planned?"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
              />

              {/* Note field */}
              <textarea
                rows={2}
                className="w-full rounded-[14px] px-4 py-3 font-quicksand text-[14px] font-semibold text-on-surface outline-none mb-4 resize-none"
                style={{ background: 'rgba(167,139,202,0.07)', border: '1.5px solid rgba(167,139,202,0.15)' }}
                placeholder="Add a note (optional)..."
                value={newTaskNote}
                onChange={e => setNewTaskNote(e.target.value)}
              />

              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1 justify-between px-1">
                {STICKERS.map(s => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setSelectedSticker(s)}
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center text-xl shrink-0"
                    style={{
                      background: selectedSticker === s ? `${monthColor}33` : 'transparent',
                      border: selectedSticker === s ? `2px solid ${monthColor}` : '2px solid transparent'
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleQuickAdd}
                className="w-full py-4 rounded-[18px] font-headline font-black text-[15px] text-white"
                style={{
                  background: `linear-gradient(135deg, ${monthColor}BB, ${monthColor})`,
                  boxShadow: `0 6px 24px ${monthColor}55`,
                }}
              >
                Add to Calendar ✨
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNavBar />
    </main>
  );
}
