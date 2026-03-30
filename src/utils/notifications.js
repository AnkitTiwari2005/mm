import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const setupNotificationChannels = async () => {
  try {
    const check = await LocalNotifications.checkPermissions();
    if (check.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
    
    // Create high-importance channels
    await LocalNotifications.createChannel({
      id: 'marshmallow_ring',
      name: 'Marshmallow Alarms',
      description: 'Persistent audible alarms',
      importance: 5, // Importance.Max
      visibility: 1, 
      vibration: true,
      sound: '', // default
    });

    await LocalNotifications.createChannel({
      id: 'marshmallow_vibrate',
      name: 'Marshmallow Silent Alarms',
      description: 'Tactile vibrations',
      importance: 4, // Importance.High
      visibility: 1,
      vibration: true,
    });
  } catch (e) {
    console.log('Failed to setup channels', e);
  }
};

export const scheduleTaskNotification = async (task) => {
  // If task has no explicit time, default to 9 AM of task.date
  const mode = localStorage.getItem('marshmallow_alarm_mode') || 'ring';
  
  if (!task.date) return;
  
  const [y, m, d] = task.date.split('-');
  const dateObj = new Date(y, parseInt(m)-1, d, 9, 0, 0); // 9 AM
  
  // If the date is already in the past, don't schedule
  if (dateObj.getTime() < Date.now()) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🌸 Time for your Plan!',
          body: `Don't forget: ${task.title} ${task.sticker || '✨'}`,
          id: parseInt(task.id.slice(-8)) || Math.floor(Math.random() * 100000),
          schedule: { at: dateObj },
          channelId: mode === 'ring' ? 'marshmallow_ring' : 'marshmallow_vibrate',
          actionTypeId: '',
          smallIcon: 'ic_stat_icon_config_sample'
        }
      ]
    });
  } catch (e) {
    console.log('Failed to schedule', e);
  }
};

export const scheduleReminderNotification = async (reminder) => {
  const mode = localStorage.getItem('marshmallow_alarm_mode') || 'ring';
  if (!reminder.enabled) return;
  
  // Real world apps parse chronological string, e.g. "8 PM", into UTC Time.
  // For immediate verification, we schedule it 10 seconds into the future.
  const triggerDate = new Date(Date.now() + 1000 * 10);
  
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🌸 Gentle Nudge',
          body: reminder.text,
          id: parseInt(reminder.id.slice(-8)) || Math.floor(Math.random() * 100000),
          schedule: { at: triggerDate },
          channelId: mode === 'ring' ? 'marshmallow_ring' : 'marshmallow_vibrate',
          actionTypeId: '',
          smallIcon: 'ic_stat_icon_config_sample'
        }
      ]
    });
  } catch (e) {
    console.log('Failed to schedule reminder', e);
  }
};

export const triggerHapticFeedback = async () => {
  try {
    const enabled = localStorage.getItem('marshmallow_notifications') !== 'false';
    if (!enabled) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    // Ignore on web
  }
};

export const testNativeAlert = async () => {
  try {
    const check = await LocalNotifications.checkPermissions();
    if (check.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
    
    // Scheduled for 3 seconds from now
    const testDate = new Date(Date.now() + 3000);
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🌸 Hardware Test Success!',
          body: 'If you hear this and feel a buzz, everything is working perfectly! ✨',
          id: 777,
          schedule: { at: testDate },
          channelId: 'marshmallow_ring',
          smallIcon: 'ic_stat_icon_config_sample'
        }
      ]
    });
    
    await Haptics.vibrate(); // Direct vibrate test
  } catch (e) {
    console.log('Test failed', e);
  }
};
