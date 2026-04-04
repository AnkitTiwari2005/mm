import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import { MascotContext } from '../contexts/MascotContext';
import Mascot from '../components/Mascot';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from '../contexts/TaskContext';
import { ReminderContext } from '../contexts/ReminderContext';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Toast } from '@capacitor/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const STAT_COLORS = ['#E879A2', '#A78BCA', '#38BDF8', '#4ECDC4'];

// Cute minimalist default avatar — simple round face with blush
const KawaiiAvatar = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#FFE4F5"/>
    <circle cx="50" cy="50" r="44" fill="#FFF0F7"/>
    {/* Eyes — simple dots */}
    <circle cx="36" cy="46" r="3.5" fill="#3D1F5C"/>
    <circle cx="64" cy="46" r="3.5" fill="#3D1F5C"/>
    {/* Eye shine */}
    <circle cx="37.5" cy="44.5" r="1.2" fill="white"/>
    <circle cx="65.5" cy="44.5" r="1.2" fill="white"/>
    {/* Blush */}
    <ellipse cx="28" cy="56" rx="7" ry="4" fill="#FDA4AF" opacity="0.45"/>
    <ellipse cx="72" cy="56" rx="7" ry="4" fill="#FDA4AF" opacity="0.45"/>
    {/* Smile */}
    <path d="M42 58 Q50 65 58 58" stroke="#E879A2" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
  </svg>
);

// Toggle component
const Toggle = ({ value, onChange, colorOn = '#E879A2' }) => (
  <motion.button
    whileTap={{ scale: 0.92 }}
    onClick={() => onChange(!value)}
    style={{
      width: 52, height: 30, borderRadius: 15,
      background: value
        ? `linear-gradient(135deg, ${colorOn}CC, ${colorOn})`
        : 'rgba(196,186,203,0.3)',
      boxShadow: value ? `0 2px 12px ${colorOn}44` : 'none',
      padding: 3,
      position: 'relative',
    }}
    className="shrink-0"
  >
    <motion.div
      animate={{ x: value ? 22 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="w-6 h-6 rounded-full bg-white"
      style={{ boxShadow: '0 2px 8px rgba(45,16,64,0.15)' }}
    />
  </motion.button>
);

export default function ProfileScreen() {
  const navigate = useNavigate();
  const {
    userName, setUserName,
    mascotSettings, setMascotSettings,
    notificationsEnabled, setNotificationsEnabled,
    profilePic, setProfilePic,
  } = useContext(UserContext);
  const { triggerRandom } = useContext(MascotContext);
  const { tasks } = useContext(TaskContext);
  const { reminders } = useContext(ReminderContext);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [isLoveLetterOpen, setIsLoveLetterOpen] = useState(false);
  const [activePicker, setActivePicker] = useState(null);
  const [vibrateOnTask, setVibrateOnTask] = useState(() => localStorage.getItem('marshmallow_vibrate_enabled') === 'true');
  const nameRef = useRef(null);

  useEffect(() => { if (isEditingName) nameRef.current?.focus(); }, [isEditingName]);
  useEffect(() => { localStorage.setItem('marshmallow_vibrate_enabled', vibrateOnTask); }, [vibrateOnTask]);

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
        source: CameraSource.Prompt,
      });
      if (image.base64String) {
        setProfilePic(`data:image/jpeg;base64,${image.base64String}`);
        await Toast.show({ text: 'Avatar updated!', duration: 'short', position: 'top' });
      }
    } catch {
      // User cancelled
    }
  };

  // Simplified mascot settings — only 2 options that actually change behavior
  const pickerOptions = {
    mood: ['Happy', 'Loving', 'Playful', 'Sleepy'],
    speed: ['Slow', 'Normal', 'Fast'],
  };

  const mascotSettingRows = [
    {
      key: 'moodPreference',
      label: 'Mallow Mood',
      desc: 'Default expression',
      iconName: 'mood',
      color: '#E879A2',
      picker: 'mood',
      val: mascotSettings?.moodPreference || 'Happy',
    },
    {
      key: 'animationSpeed',
      label: 'Animation Speed',
      desc: 'How fast Mallow moves',
      iconName: 'speed',
      color: '#A78BCA',
      picker: 'speed',
      val: mascotSettings?.animationSpeed || 'Normal',
    },
  ];

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const hasDoneTaskToday = tasks.some(t => t.completed);
  const currentStreak = hasDoneTaskToday ? 'Active' : 'Idle';

  const stats = [
    { label: 'Tasks', value: totalTasks, iconName: 'task_alt' },
    { label: 'Done', value: completedTasks, iconName: 'check_circle' },
    { label: 'Reminders', value: reminders.length, iconName: 'notifications' },
    { label: 'Streak', value: currentStreak, iconName: 'local_fire_department' },
  ];

  const handleTestVibrate = async () => {
    try {
      await Haptics.vibrate({ duration: 500 });
      await Toast.show({ text: 'Vibration test!', duration: 'short', position: 'top' });
    } catch { /* */ }
  };

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

      {/* HEADER */}
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
        {/* AVATAR CARD */}
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
              {profilePic ? (
                <img src={profilePic} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <KawaiiAvatar size={96} />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="material-symbols-rounded text-white" style={{ fontSize: 28 }}>photo_camera</span>
              </div>
            </motion.div>
          </div>

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
              <p className="font-quicksand text-[11px] font-bold text-on-surface-muted">Tap outside to save</p>
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

        {/* STATS ROW */}
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
              <span className="material-symbols-rounded mb-1" style={{ fontSize: 20, color: STAT_COLORS[i] }}>{s.iconName}</span>
              <span className="font-headline text-[16px] font-black" style={{ color: STAT_COLORS[i] }}>{s.value}</span>
              <span className="font-quicksand text-[8px] font-bold text-on-surface-muted uppercase tracking-wide leading-none">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* MALLOW EXPERIENCE */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-5 mt-5"
        >
          <p className="font-headline text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-muted mb-3 ml-1 flex items-center gap-2">
            <span className="material-symbols-rounded" style={{ fontSize: 14, color: '#E879A2' }}>auto_awesome</span>
            Mallow Experience
          </p>
          <div
            className="rounded-[24px] overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(30px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
            }}
          >
            {mascotSettingRows.map((s, i) => (
              <motion.button
                key={s.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePicker(s.picker)}
                className="w-full flex items-center justify-between px-5 py-4 transition-all"
                style={{
                  background: 'transparent',
                  borderTop: i > 0 ? '1px solid rgba(196,186,203,0.12)' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                    style={{ background: `${s.color}15` }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 18, color: s.color }}>{s.iconName}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-headline text-[15px] font-black text-on-surface block">{s.label}</span>
                    <span className="font-quicksand text-[10px] font-semibold text-on-surface-muted">{s.desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-headline text-[10px] font-black uppercase tracking-widest" style={{ color: s.color }}>
                    {s.val}
                  </span>
                  <span className="material-symbols-rounded text-on-surface-muted" style={{ fontSize: 16 }}>chevron_right</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* NOTIFICATION PREFERENCES */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-5 mt-5"
        >
          <p className="font-headline text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-muted mb-3 ml-1 flex items-center gap-2">
            <span className="material-symbols-rounded" style={{ fontSize: 14, color: '#A78BCA' }}>notifications</span>
            Alerts & Alarm
          </p>
          <div
            className="rounded-[24px] overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(30px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
            }}
          >
            {/* Push Notifications */}
            <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(196,186,203,0.12)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] flex items-center justify-center" style={{ background: 'rgba(232,121,162,0.1)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#E879A2' }}>notifications_active</span>
                </div>
                <div>
                  <p className="font-headline text-[15px] font-black text-on-surface">Push Notifications</p>
                  <p className="font-quicksand text-[11px] font-semibold text-on-surface-muted">Task reminders & wellness pings</p>
                </div>
              </div>
              <Toggle value={notificationsEnabled} onChange={setNotificationsEnabled} colorOn="#E879A2" />
            </div>

            {/* Vibration on task */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] flex items-center justify-center" style={{ background: 'rgba(167,139,202,0.1)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#A78BCA' }}>vibration</span>
                </div>
                <div>
                  <p className="font-headline text-[15px] font-black text-on-surface">Vibrate on Task Time</p>
                  <p className="font-quicksand text-[11px] font-semibold text-on-surface-muted">Continuous vibration when task arrives</p>
                </div>
              </div>
              <Toggle
                value={vibrateOnTask}
                onChange={(v) => {
                  setVibrateOnTask(v);
                  if (v) handleTestVibrate();
                }}
                colorOn="#A78BCA"
              />
            </div>
          </div>
        </motion.div>

        {/* SECRET LOVE LETTER */}
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
              className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.7)' }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 32, color: '#E879A2' }}>favorite</span>
            </motion.div>
            <div className="text-left">
              <h4 className="font-headline text-[17px] font-black" style={{ color: '#BE185D' }}>
                A Secret Note
              </h4>
              <p className="font-quicksand text-[12px] font-semibold text-on-surface-muted">Open with love</p>
            </div>
            <div className="ml-auto">
              <span className="material-symbols-rounded" style={{ color: '#E879A2', fontSize: 20 }}>chevron_right</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-10 opacity-20">
          <p className="font-headline text-[10px] uppercase tracking-[0.5em] font-black">Marshmallow</p>
          <p className="font-headline text-[9px] uppercase tracking-[0.3em] mt-1 italic font-black">crafted with love</p>
        </div>
      </div>

      {/* LOVE LETTER MODAL */}
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
              {['favorite', 'auto_awesome', 'local_florist', 'star', 'cake'].map((icon, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
                  transition={{ duration: 3 + i, repeat: Infinity }}
                  className="absolute pointer-events-none"
                  style={{ top: `${10 + i * 15}%`, left: i % 2 === 0 ? '5%' : '88%', opacity: 0.6 }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#E879A2' }}>{icon}</span>
                </motion.div>
              ))}

              <div className="mb-5 -mt-2">
                <Mascot size={110} customEmote="loving" showGlow={false} customMessage="" />
              </div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="font-headline text-[28px] font-black text-center mb-4"
                style={{ color: '#BE185D' }}
              >
                Hey my baby
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="font-body text-[15px] text-on-surface-variant leading-relaxed text-center font-semibold mb-3"
              >
                I made this little universe just for you, my baby. Every pixel was crafted to make you smile every single day.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                className="font-quicksand text-[14px] font-bold text-center italic"
                style={{ color: '#E879A2' }}
              >
                You are my center of gravity. Always. — Ankii
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
                Keep it in my heart
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PICKER SHEET */}
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
                {{ mood: 'Mallow Mood', speed: 'Animation Speed' }[activePicker]}
              </h2>
              <div className="space-y-2">
                {pickerOptions[activePicker].map(opt => {
                  const settingKey = activePicker === 'mood' ? 'moodPreference' : 'animationSpeed';
                  const isActive = mascotSettings?.[settingKey] === opt;
                  return (
                    <motion.button
                      key={opt}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const updated = { ...mascotSettings, [settingKey]: opt };
                        setMascotSettings(updated);
                        localStorage.setItem('marshmallow_settings', JSON.stringify(updated));
                        triggerRandom(activePicker === 'mood' ? opt.toLowerCase() : 'happy');
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
