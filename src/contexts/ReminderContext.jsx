import React, { createContext, useState, useEffect } from 'react';
import { Toast } from '@capacitor/toast';
import { triggerHapticFeedback, scheduleReminderNotification } from '../utils/notifications';

export const ReminderContext = createContext();

const defaultReminders = [];

export const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('marshmallow_reminders');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Remove the original 6 mock hardcoded reminders by their exact string IDs ('1' to '6') so the user sees 0
      const filtered = parsed.filter(r => !['1', '2', '3', '4', '5', '6'].includes(r.id));
      if (filtered.length !== parsed.length) {
         localStorage.setItem('marshmallow_reminders', JSON.stringify(filtered));
         return filtered;
      }
      return parsed;
    }
    return defaultReminders;
  });

  useEffect(() => {
    localStorage.setItem('marshmallow_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const toggleReminder = async (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    triggerHapticFeedback();
    
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    const isNowEnabled = !reminder.enabled;
    try {
      await Toast.show({
        text: isNowEnabled ? `Reminder On: ${reminder.text} ✨` : `Notification Off 🌙`,
        duration: 'short', position: 'top'
      });
    } catch (e) { console.error('Toast failed:', e); }
  };
  
  const addReminder = async (reminder) => {
    const newRem = { ...reminder, id: Date.now().toString() };
    setReminders(prev => [...prev, newRem]);
    triggerHapticFeedback();
    try {
      if (newRem.enabled) await scheduleReminderNotification(newRem);
      await Toast.show({
        text: `New reminder saved ✨`,
        duration: 'short', position: 'top'
      });
    } catch (e) { console.error('Reminder schedule or toast failed:', e); }
  };

  return (
    <ReminderContext.Provider value={{ reminders, toggleReminder, addReminder }}>
      {children}
    </ReminderContext.Provider>
  );
};
