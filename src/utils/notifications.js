import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// --- Cute notification message banks ---
const TASK_REMINDERS = {
  fourHour: [
    (title) => ({ t: 'Hey my baby!', b: `"${title}" is coming up in 4 hours. You have plenty of time to shine!` }),
    (title) => ({ t: 'A little heads-up!', b: `Just a tiny reminder: "${title}" is 4 hours away! You are going to crush it` }),
    (title) => ({ t: 'Dreaming ahead...', b: `"${title}" in 4 hours! Time to plan something magical!` }),
  ],
  twoHour: [
    (title) => ({ t: 'Getting closer!', b: `"${title}" is in 2 hours, my baby! Start preparing your magic` }),
    (title) => ({ t: 'Two hours away!', b: `Do not forget - "${title}" in 2 hours. You have got this!` }),
    (title) => ({ t: 'Almost time!', b: `"${title}" is 2 hours away! Take a deep breath and get ready beautiful` }),
  ],
  thirtyMin: [
    (title) => ({ t: '30 minutes to go!', b: `"${title}" is almost here! Get cozy and ready, my baby` }),
    (title) => ({ t: 'Nearly there!', b: `Just 30 minutes until "${title}"! You look amazing already` }),
    (title) => ({ t: 'Countdown mode!', b: `"${title}" in 30 mins! Take a sip of water and smile` }),
  ],
  onTime: [
    (title) => ({ t: 'It is time, my baby!', b: `"${title}" - this is your moment! Go show the world what you can do` }),
    (title) => ({ t: 'Now is the moment!', b: `"${title}" starts right now! You are unstoppable` }),
    (title) => ({ t: 'Action time!', b: `"${title}" - let us go! I believe in you completely` }),
  ],
};

const WELLNESS_MESSAGES = [
  { t: 'Hydration check!', b: "Hey beautiful! Have you had water recently? Your body loves you - treat it right" },
  { t: 'Self-care reminder', b: "Take a deep breath. Relax your shoulders. You are doing amazingly well" },
  { t: 'Little break time', b: "Step away for 5 minutes! Rest is part of the magic" },
  { t: 'You are incredible!', b: "Just a reminder - you are absolutely amazing. Keep being you!" },
  { t: 'Posture check!', b: "Sit up straight, lovely! Your spine sends its love" },
  { t: 'Breathe deeply', b: "Inhale peace, exhale stress. You have got this, and everything will be okay" },
  { t: 'Sunshine check!', b: "You are the sunshine in someone's world. Do not forget that today" },
  { t: 'Rest is productive', b: "If you are tired, rest a little. Even flowers need rain to bloom" },
  { t: 'You matter!', b: "Please take care of yourself. You are irreplaceable" },
  { t: 'Marshmallow says hi!', b: "Mallow misses you! Take a tiny break and tap on me for a hug" },
];

const LOVE_MESSAGES = [
  { t: 'A love note for you', b: "Every moment with you in this little app feels like magic. You are so special" },
  { t: 'Just so you know...', b: "Made this app with all the love I could pour in. Thinking of you always" },
  { t: 'From Ankii, with love', b: "You are my favorite notification in the world" },
  { t: 'A tiny whisper...', b: "This app was made for the most precious person - you, my baby" },
];

export const setupNotificationChannels = async () => {
  try {
    // Request permissions first
    const check = await LocalNotifications.checkPermissions();
    if (check.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // Create high-priority alarm channel with sound & vibration
    await LocalNotifications.createChannel({
      id: 'marshmallow_alarm',
      name: 'Marshmallow Task Alarms',
      description: 'Important task time alarms with sound and vibration',
      importance: 5,
      visibility: 1,
      vibration: true,
      sound: 'default',
      lights: true,
      lightColor: '#E879A2',
    });

    // Wellness channel - gentle
    await LocalNotifications.createChannel({
      id: 'marshmallow_wellness',
      name: 'Marshmallow Wellness',
      description: 'Gentle wellness and love reminders',
      importance: 3,
      visibility: 1,
      vibration: true,
      sound: 'default',
    });

    // Chat channel - high priority for messages
    await LocalNotifications.createChannel({
      id: 'marshmallow_chat',
      name: 'Marshmallow Chat',
      description: 'Notifications for new messages in Our Space',
      importance: 5,
      visibility: 1,
      vibration: true,
      sound: 'default',
      lights: true,
      lightColor: '#E879A2',
    });

    // Register listener for received notifications to trigger vibration
    LocalNotifications.addListener('localNotificationReceived', async (notification) => {
      const vibrateEnabled = localStorage.getItem('marshmallow_vibrate_enabled') === 'true';
      if (vibrateEnabled) {
        try {
          for (let i = 0; i < 10; i++) {
            await Haptics.vibrate({ duration: 1000 });
            await new Promise(r => setTimeout(r, 2000));
          }
        } catch { /* ignore */ }
      }
    });

  } catch (e) {
    console.warn('Notification setup error:', e);
  }
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate a stable numeric ID from task ID string
const stableId = (taskId, offset) => {
  let hash = 0;
  const str = String(taskId);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) + offset;
};

export const scheduleTaskNotification = async (task) => {
  if (!task.date) return;

  const [y, m, d] = task.date.split('-');
  const timeStr = task.time || '09:00';
  const [hh, mm] = timeStr.split(':');
  const taskDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hh), parseInt(mm), 0);

  if (taskDate.getTime() <= Date.now()) return;

  const base = stableId(task.id, 0);
  const schedules = [];

  // 4 hours before
  const d4 = new Date(taskDate.getTime() - 4 * 60 * 60 * 1000);
  if (d4 > new Date()) {
    const msg = pick(TASK_REMINDERS.fourHour)(task.title);
    schedules.push({
      title: msg.t,
      body: msg.b,
      id: base + 1,
      schedule: { at: d4, allowWhileIdle: true, exact: true },
      channelId: 'marshmallow_alarm',
      smallIcon: 'ic_notification',
      sound: 'default',
    });
  }

  // 2 hours before
  const d2 = new Date(taskDate.getTime() - 2 * 60 * 60 * 1000);
  if (d2 > new Date()) {
    const msg = pick(TASK_REMINDERS.twoHour)(task.title);
    schedules.push({
      title: msg.t,
      body: msg.b,
      id: base + 2,
      schedule: { at: d2, allowWhileIdle: true, exact: true },
      channelId: 'marshmallow_alarm',
      smallIcon: 'ic_notification',
      sound: 'default',
    });
  }

  // 30 minutes before
  const d30 = new Date(taskDate.getTime() - 30 * 60 * 1000);
  if (d30 > new Date()) {
    const msg = pick(TASK_REMINDERS.thirtyMin)(task.title);
    schedules.push({
      title: msg.t,
      body: msg.b,
      id: base + 3,
      schedule: { at: d30, allowWhileIdle: true, exact: true },
      channelId: 'marshmallow_alarm',
      smallIcon: 'ic_notification',
      sound: 'default',
    });
  }

  // On-time alarm
  if (taskDate > new Date()) {
    const msg = pick(TASK_REMINDERS.onTime)(task.title);
    schedules.push({
      title: msg.t,
      body: msg.b,
      id: base + 4,
      schedule: { at: taskDate, allowWhileIdle: true, exact: true },
      channelId: 'marshmallow_alarm',
      smallIcon: 'ic_notification',
      sound: 'default',
      ongoing: true,
    });
  }

  try {
    if (schedules.length > 0) {
      await LocalNotifications.schedule({ notifications: schedules });
    }
  } catch (e) {
    console.warn('Schedule error:', e);
  }
};

export const cancelTaskNotifications = async (taskId) => {
  const base = stableId(taskId, 0);
  try {
    await LocalNotifications.cancel({ notifications: [
      { id: base + 1 }, { id: base + 2 }, { id: base + 3 }, { id: base + 4 }
    ]});
  } catch { /* ignore */ }
};

export const rescheduleAllTasks = async (tasks) => {
  // Cancel all pending first, then re-schedule upcoming ones
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch { /* ignore */ }

  for (const task of tasks) {
    if (!task.completed) {
      await scheduleTaskNotification(task);
    }
  }
};

export const scheduleWellnessNotifications = async () => {
  const enabled = localStorage.getItem('marshmallow_notifications') !== 'false';
  if (!enabled) return;

  const now = new Date();
  const baseId = 90000;
  const notifications = [];

  const intervals = [2.5, 2.0, 3.0, 1.5, 2.5, 4.0];
  let nextTime = new Date(now.getTime() + 60 * 60 * 1000);

  intervals.forEach((hrs, i) => {
    nextTime = new Date(nextTime.getTime() + hrs * 60 * 60 * 1000);
    const h = nextTime.getHours();
    if (h >= 8 && h <= 22) {
      const isLove = i === 2 || i === 5;
      const msg = isLove ? pick(LOVE_MESSAGES) : pick(WELLNESS_MESSAGES);
      notifications.push({
        title: msg.t,
        body: msg.b,
        id: baseId + i,
        schedule: { at: nextTime, allowWhileIdle: true, exact: true },
        channelId: 'marshmallow_wellness',
        smallIcon: 'ic_notification',
        sound: 'default',
      });
    }
  });

  try {
    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.warn('Wellness schedule error:', e);
  }
};

// Calendar plan notifications
const PLAN_REMINDERS = {
  sevenDay: (title) => ({
    t: 'Coming up in a week!',
    b: `"${title}" is just 7 days away, my baby! You have plenty of time to prepare`,
  }),
  twoDays: (title) => ({
    t: 'Almost time!',
    b: `"${title}" is in 2 days! Start getting ready, beautiful`,
  }),
  oneDay: (title) => ({
    t: 'Tomorrow is the day!',
    b: `Do not forget - "${title}" is tomorrow! You are going to do amazingly`,
  }),
  today: (title) => ({
    t: 'Today is the day!',
    b: `"${title}" is happening TODAY! Go show the world what you have got, my baby`,
  }),
};

export const schedulePlanNotifications = async (plan) => {
  if (!plan.date || !plan.title) return;
  const enabled = localStorage.getItem('marshmallow_notifications') !== 'false';
  if (!enabled) return;

  const [y, m, d] = plan.date.split('-');
  const planDay = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 8, 0, 0);

  if (planDay.getTime() <= Date.now()) return;

  const base = stableId(plan.id, 50000);
  const notifications = [];

  const d7 = new Date(planDay.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (d7 > new Date()) {
    const msg = PLAN_REMINDERS.sevenDay(plan.title);
    notifications.push({
      title: msg.t, body: msg.b, id: base + 1,
      schedule: { at: d7, allowWhileIdle: true, exact: true },
      channelId: 'marshmallow_wellness',
      smallIcon: 'ic_notification', sound: 'default',
    });
  }

  const d2 = new Date(planDay.getTime() - 2 * 24 * 60 * 60 * 1000);
  if (d2 > new Date()) {
    const msg = PLAN_REMINDERS.twoDays(plan.title);
    notifications.push({
      title: msg.t, body: msg.b, id: base + 2,
      schedule: { at: d2, allowWhileIdle: true, exact: true },
      channelId: 'marshmallow_wellness',
      smallIcon: 'ic_notification', sound: 'default',
    });
  }

  const d1 = new Date(planDay.getTime() - 1 * 24 * 60 * 60 * 1000);
  if (d1 > new Date()) {
    const msg = PLAN_REMINDERS.oneDay(plan.title);
    notifications.push({
      title: msg.t, body: msg.b, id: base + 3,
      schedule: { at: d1, allowWhileIdle: true, exact: true },
      channelId: 'marshmallow_alarm',
      smallIcon: 'ic_notification', sound: 'default',
    });
  }

  if (planDay > new Date()) {
    const msg = PLAN_REMINDERS.today(plan.title);
    notifications.push({
      title: msg.t, body: msg.b, id: base + 4,
      schedule: { at: planDay, allowWhileIdle: true, exact: true },
      channelId: 'marshmallow_alarm',
      smallIcon: 'ic_notification', sound: 'default', ongoing: true,
    });
  }

  try {
    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.warn('Plan notification error:', e);
  }
};

export const scheduleReminderNotification = async (reminder) => {
  if (!reminder.enabled) return;
  const triggerDate = new Date(Date.now() + 1000 * 10);
  try {
    await LocalNotifications.schedule({
      notifications: [{
        title: 'Gentle Nudge',
        body: reminder.text,
        id: stableId(reminder.id, 70000),
        schedule: { at: triggerDate, allowWhileIdle: true, exact: true },
        channelId: 'marshmallow_alarm',
        smallIcon: 'ic_notification',
        sound: 'default',
      }]
    });
  } catch (e) {
    console.warn('Reminder schedule error:', e);
  }
};

export const triggerHapticFeedback = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch { /* ignore */ }
};
