import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import Mascot from '../components/Mascot';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from '../contexts/TaskContext';
import { ReminderContext } from '../contexts/ReminderContext';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Toast } from '@capacitor/toast';

const STAT_COLORS = ['#E879A2', '#A78BCA', '#38BDF8', '#4ECDC4'];

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { userName, setUserName, mascotSettings, setMascotSettings, notificationsEnabled, setNotificationsEnabled, profilePic, setProfilePic, alarmMode, setAlarmMode } = useContext(UserContext);
  const { tasks } = useContext(TaskContext);
  const { reminders } = useContext(ReminderContext);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [isLoveLetterOpen, setIsLoveLetterOpen] = useState(false);
  const [activePicker, setActivePicker] = useState(null);
  const nameRef = useRef(null);

  useEffect(() => { if (isEditingName) nameRef.current?.focus(); }, [isEditingName]);

  const handleNameSave = () => {
    if (editName.trim()) setUserName(editName.trim());
    else setEditName(userName);
    setIsEditingName(false);
  };

  const handleAvatarClick = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });
      if (image.base64String) {
        setProfilePic(`data:image/jpeg;base64,${image.base64String}`);
        await Toast.show({ text: 'Avatar updated perfectly! ✨', duration: 'short', position: 'top' });
      }
    } catch (e) {
      console.log('User cancelled camera/gallery prompt', e);
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  const hasDoneTaskToday = tasks.some(t => t.completed); 
  const currentStreak = hasDoneTaskToday ? 'Active 🔥' : 'Idle ☁️';

  const pickerOptions = {
    mood:  ['Adaptive 🌈', 'Always Happy 😄', 'Extra Loving 💕', 'Chill ☁️'],
    speed: ['Slow & Dreamy 🌙', 'Normal ✨', 'Bouncy & Peppy 🎀'],
    idle:  ['Float Gently ☁️', 'Naptime 💤', 'Wander Around 🌸'],
  };

  const stats = [
    { label: 'Tasks Total', value: totalTasks,      icon: '📋' },
    { label: 'Completed',   value: completedTasks,  icon: '✅' },
    { label: 'Reminders',   value: reminders.length, icon: '🔔' },
    { label: 'Streak',      value: currentStreak,    icon: '✨' },
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full flex flex-col relative"
      style={{ background: '#FFF5FA', paddingBottom: 40 }}
    >
      {/* Aurora BG */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
      </div>

      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-2 flex items-center justify-between relative z-10"
      >
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/home')}
          className="w-11 h-11 rounded-[16px] flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 16px rgba(45,16,64,0.06)',
          }}
        >
          <span className="material-symbols-rounded text-on-surface-variant" style={{ fontSize: 20 }}>arrow_back</span>
        </motion.button>
        <h1 className="font-headline text-[20px] font-black text-on-surface">My Profile</h1>
        <div className="w-11 h-11 opacity-0" />
      </motion.header>

      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
        {/* ── AVATAR CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-5 mt-5 rounded-[28px] p-6 flex flex-col items-center"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(30px)',
            border: '1.5px solid rgba(255,255,255,0.95)',
            boxShadow: '0 8px 36px rgba(45,16,64,0.07)',
          }}
        >
          {/* Avatar with ring */}
          <div className="relative mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 rounded-full"
              style={{
                background: 'conic-gradient(#F9A8D4, #C4B5FD, #7DD3FC, #F9A8D4)',
                padding: 3,
                borderRadius: '50%',
              }}
            />
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={handleAvatarClick}
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white cursor-pointer"
              style={{ boxShadow: '0 4px 20px rgba(45,16,64,0.12)' }}
            >
              <img
                src={profilePic || `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${userName || 'marshmallow'}&backgroundColor=fff5fa`}
                className="w-full h-full object-cover scale-110"
                alt="avatar"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="material-symbols-rounded text-white" style={{ fontSize: 28 }}>photo_camera</span>
              </div>
            </motion.div>
          </div>

          {/* Editable name */}
          {isEditingName ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <input
                ref={nameRef}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                className="w-full text-center font-headline text-[26px] font-black text-on-surface outline-none rounded-[16px] py-2 px-4"
                style={{ background: 'rgba(232,121,162,0.07)', border: '2px solid rgba(232,121,162,0.2)' }}
              />
              <p className="font-quicksand text-[11px] font-bold text-on-surface-muted">Tap outside to save ✦</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <h2 className="font-headline text-[32px] font-black text-on-surface">{userName || 'Sunshine'}</h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full font-headline text-[11px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(232,121,162,0.08)', color: '#E879A2' }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>edit</span>
                Edit Name
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* ── STATS ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mx-5 mt-4 grid grid-cols-4 gap-2"
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="rounded-[20px] p-3 flex flex-col items-center text-center"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255,255,255,0.9)',
              }}
            >
              <span className="text-xl mb-1">{s.icon}</span>
              <span className="font-headline text-[18px] font-black" style={{ color: STAT_COLORS[i] }}>{s.value}</span>
              <span className="font-quicksand text-[8px] font-bold text-on-surface-muted uppercase tracking-wide leading-none">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── MASCOT SETTINGS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-5 mt-5"
        >
          <p className="font-headline text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-muted mb-3 ml-1 flex items-center gap-2">
            <span>✨</span> Mallow Experience
          </p>
          <div
            className="rounded-[24px] overflow-hidden divide-y"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(30px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
              divideColor: 'rgba(232,121,162,0.06)',
            }}
          >
            {[
              { key: 'moodPreference', label: 'Mood Vibes', icon: '🌈', picker: 'mood', val: mascotSettings?.moodPreference || 'Adaptive' },
              { key: 'animationSpeed', label: 'Magic Pacing', icon: '✨', picker: 'speed', val: mascotSettings?.animationSpeed || 'Normal' },
              { key: 'idleBehavior',   label: 'Idle Style', icon: '☁️', picker: 'idle',  val: mascotSettings?.idleBehavior || 'Float Gently' },
            ].map(s => (
              <motion.button
                key={s.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePicker(s.picker)}
                className="w-full flex items-center justify-between px-5 py-4 transition-all"
                style={{ background: 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[18px]">{s.icon}</span>
                  <span className="font-headline text-[15px] font-black text-on-surface">{s.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-headline text-[10px] font-black uppercase tracking-widest text-on-surface-muted">
                    {s.val}
                  </span>
                  <span className="material-symbols-rounded text-on-surface-muted" style={{ fontSize: 16 }}>chevron_right</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── PREFERENCES ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-5 mt-5"
        >
          <p className="font-headline text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-muted mb-3 ml-1 flex items-center gap-2">
            <span>⚙️</span> Application Settings
          </p>
          <div
            className="rounded-[24px] overflow-hidden divide-y"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(30px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
              divideColor: 'rgba(232,121,162,0.08)',
            }}
          >
            {/* 🛡️ Hardware Debug */}
            <div className="px-5 py-5 bg-[rgba(232,121,162,0.03)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <span className="font-headline text-[15px] font-black text-on-surface">Hardware Debug</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    const { testNativeAlert } = await import('../utils/notifications');
                    await testNativeAlert();
                    await Toast.show({ text: 'Test fired! ⚡ Vibrate and sound in 3s!', duration: 'long', position: 'top' });
                  }}
                  className="px-4 py-1.5 rounded-full font-headline text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ background: 'linear-gradient(135deg, #E879A2, #BE185D)' }}
                >
                  Run Test
                </motion.button>
              </div>
              <p className="font-quicksand text-[11px] font-medium text-on-surface-muted leading-relaxed">
                If the test fails, ensure <span className="font-bold">Marshmallow</span> has "Exact Alarms" and "Notifications" enabled in Android Settings. ✨
              </p>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-[18px]">🔔</span>
                <span className="font-headline text-[15px] font-black text-on-surface">Enable Alerts</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="w-12 h-6 rounded-full relative p-1 transition-colors"
                style={{ background: notificationsEnabled ? '#E879A2' : '#C4B5CB' }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full bg-white shadow-sm"
                  animate={{ x: notificationsEnabled ? 24 : 0 }}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── PREFERENCES ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-5 mt-5"
        >
          <p className="font-headline text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-muted mb-3 ml-1 flex items-center gap-2">
            <span>🔔</span> Preferences
          </p>
          <div
            className="rounded-[24px] overflow-hidden divide-y"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(30px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
              divideColor: 'rgba(232,121,162,0.06)',
            }}
          >
            {/* Alarm Mode row */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[18px]">{alarmMode === 'ring' ? '🔊' : '📳'}</span>
                <div>
                  <p className="font-headline text-[15px] font-black text-on-surface">Alarm Mode</p>
                  <p className="font-quicksand text-[11px] font-semibold text-on-surface-muted">
                    {alarmMode === 'ring' ? 'Loud 30s Ring' : 'Continuous 30s Vibrate'}
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setAlarmMode(alarmMode === 'ring' ? 'vibrate' : 'ring')}
                style={{
                  width: 52, height: 30, borderRadius: 15,
                  background: alarmMode === 'ring' ? 'linear-gradient(135deg, #F9A8D4, #E879A2)' : 'rgba(196,186,203,0.3)',
                  boxShadow: alarmMode === 'ring' ? '0 2px 12px rgba(232,121,162,0.4)' : 'none',
                  padding: 3,
                }}
                className="relative"
              >
                <motion.div
                  animate={{ x: alarmMode === 'ring' ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-6 h-6 rounded-full bg-white"
                  style={{ boxShadow: '0 2px 8px rgba(45,16,64,0.15)' }}
                />
              </motion.button>
            </div>

            {/* Haptics row */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[18px]">✨</span>
                <div>
                  <p className="font-headline text-[15px] font-black text-on-surface">Haptic Feedback</p>
                  <p className="font-quicksand text-[11px] font-semibold text-on-surface-muted">Gentle tap vibrations</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                style={{
                  width: 52, height: 30, borderRadius: 15,
                  background: notificationsEnabled ? 'linear-gradient(135deg, #7DD3FC, #38BDF8)' : 'rgba(196,186,203,0.3)',
                  boxShadow: notificationsEnabled ? '0 2px 12px rgba(56,189,248,0.4)' : 'none',
                  padding: 3,
                }}
                className="relative"
              >
                <motion.div
                  animate={{ x: notificationsEnabled ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-6 h-6 rounded-full bg-white"
                  style={{ boxShadow: '0 2px 8px rgba(45,16,64,0.15)' }}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── SECRET LOVE LETTER ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-5 mt-5"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsLoveLetterOpen(true)}
            className="w-full rounded-[24px] p-5 flex items-center gap-4 overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(253,207,232,0.6) 0%, rgba(221,214,254,0.6) 100%)',
              border: '1.5px solid rgba(249,168,212,0.3)',
              boxShadow: '0 4px 20px rgba(232,121,162,0.12)',
            }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.7)' }}
            >
              💌
            </motion.div>
            <div className="text-left">
              <h4 className="font-headline text-[17px] font-black" style={{ color: '#BE185D' }}>
                A Secret Note
              </h4>
              <p className="font-quicksand text-[12px] font-semibold text-on-surface-muted">Open with love 💕</p>
            </div>
            <div className="ml-auto">
              <span className="material-symbols-rounded" style={{ color: '#E879A2', fontSize: 20 }}>chevron_right</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-10 opacity-20">
          <p className="font-headline text-[10px] uppercase tracking-[0.5em] font-black">Marshmallow ✨</p>
          <p className="font-headline text-[9px] uppercase tracking-[0.3em] mt-1 italic font-black">crafted with love 💕</p>
        </div>
      </div>

      {/* ── LOVE LETTER MODAL ── */}
      <AnimatePresence>
        {isLoveLetterOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: 'rgba(255,245,250,0.92)', backdropFilter: 'blur(40px)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 60, rotate: -3 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', bounce: 0.35 }}
              className="w-full max-w-sm rounded-[40px] p-9 flex flex-col items-center relative overflow-hidden"
              style={{
                background: 'white',
                boxShadow: '0 40px 100px rgba(232,121,162,0.25), 0 8px 32px rgba(45,16,64,0.1)',
                border: '6px solid #FFE4F5',
              }}
            >
              {/* Confetti decor */}
              {['🌸', '✨', '💕', '⭐', '🎀'].map((e, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
                  transition={{ duration: 3 + i, repeat: Infinity }}
                  className="absolute text-[16px] pointer-events-none"
                  style={{
                    top: `${10 + i * 15}%`,
                    left: i % 2 === 0 ? '5%' : '88%',
                    opacity: 0.6,
                  }}
                >{e}</motion.div>
              ))}

              <div className="mb-5 -mt-2">
                <Mascot size={110} customEmote="loving" showGlow={false} customMessage="" />
              </div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="font-headline text-[28px] font-black text-center mb-4"
                style={{ color: '#BE185D' }}
              >
                Hey Sunshine ☀️
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="font-body text-[15px] text-on-surface-variant leading-relaxed text-center font-semibold mb-3"
              >
                I made this little universe just for you. Every pixel was crafted to make you smile every single day.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                className="font-quicksand text-[14px] font-bold text-center italic"
                style={{ color: '#E879A2' }}
              >
                You're the center of my favorite stories. 💕
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsLoveLetterOpen(false)}
                className="w-full mt-7 h-[54px] rounded-[20px] font-headline font-black text-[16px] text-white"
                style={{ background: 'linear-gradient(135deg, #F9A8D4, #E879A2, #BE185D)', boxShadow: '0 6px 24px rgba(232,121,162,0.4)' }}
              >
                Keep it in my heart 🤍
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PICKER SHEET ── */}
      <AnimatePresence>
        {activePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActivePicker(null)}
              className="fixed inset-0 z-[80]"
              style={{ background: 'rgba(45,16,64,0.15)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-[90] rounded-t-[36px] px-6 pt-4 pb-12"
              style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(40px)', boxShadow: '0 -20px 60px rgba(45,16,64,0.1)' }}
            >
              <div className="w-14 h-1.5 rounded-full mx-auto mb-5" style={{ background: 'rgba(196,186,203,0.4)' }} />
              <h2 className="font-headline text-[22px] font-black text-on-surface mb-5">
                {{mood: 'Mood Vibes 🌈', speed: 'Magic Pacing ✨', idle: 'Idle Style ☁️'}[activePicker]}
              </h2>
              <div className="space-y-2">
                {pickerOptions[activePicker].map(opt => {
                  const settingKey = activePicker === 'mood' ? 'moodPreference' : activePicker === 'speed' ? 'animationSpeed' : 'idleBehavior';
                  const isActive = mascotSettings?.[settingKey] === opt;
                  return (
                    <motion.button
                      key={opt}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setMascotSettings(p => ({ ...p, [settingKey]: opt }));
                        setActivePicker(null);
                      }}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-[18px] transition-all"
                      style={{
                        background: isActive ? 'rgba(232,121,162,0.08)' : 'rgba(196,186,203,0.08)',
                        border: isActive ? '1.5px solid rgba(232,121,162,0.2)' : '1.5px solid transparent',
                      }}
                    >
                      <span className="font-headline text-[15px] font-black text-on-surface">{opt}</span>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#E879A2' }}>
                          <span className="material-symbols-rounded text-white" style={{ fontSize: 12 }}>check</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
