import React, { createContext, useState, useEffect } from 'react';
import { Toast } from '@capacitor/toast';
import { triggerHapticFeedback, scheduleReminderNotification } from '../utils/notifications';

export const ReminderContext = createContext();

const defaultReminders = [
  { id: '1', text: "Time to drink water 💧", schedule: "every 2 hours", enabled: true, icon: "water_drop" },
  { id: '2', text: "Journal time 📔", schedule: "8 PM", enabled: true, icon: "menu_book" },
  { id: '3', text: "Morning stretches 🧘‍♀️", schedule: "7 AM", enabled: false, icon: "self_improvement" },
  { id: '4', text: "Don't forget your task 🌸", schedule: "when tasks pending", enabled: true, icon: "task_alt" },
  { id: '5', text: "Take a break, cutie ☁️", schedule: "every 90 mins", enabled: true, icon: "cloud" },
  { id: '6', text: "Bedtime wind-down 🌙", schedule: "10:30 PM", enabled: false, icon: "nights_stay" },
];

export const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('marshmallow_reminders');
    return saved ? JSON.parse(saved) : defaultReminders;
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
