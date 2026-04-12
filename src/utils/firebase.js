import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, serverTimestamp, query, limitToLast } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDz24RaH6IB9rClHW09e_OhC3AE3orraqo",
  authDomain: "marshmallow-bba0e.firebaseapp.com",
  databaseURL: "https://marshmallow-bba0e-default-rtdb.firebaseio.com",
  projectId: "marshmallow-bba0e",
  storageBucket: "marshmallow-bba0e.firebasestorage.app",
  messagingSenderId: "146615511768",
  appId: "1:146615511768:web:a2325e6da5432885c7c5ad",
  measurementId: "G-H3EPJ1JSS7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ── Shared Chat helpers ──

export const sendMessage = async (text, senderName) => {
  const messagesRef = ref(db, 'messages');
  const result = await push(messagesRef, {
    text,
    sender: senderName,
    timestamp: serverTimestamp(),
    createdAt: Date.now(),
  });

  // Silently trigger background push notification via Vercel backend
  try {
    fetch('https://marshmallow-backend.vercel.app/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderName, messageText: text }),
    }).catch(console.error);
  } catch (e) {
    console.error('Notify callback failed:', e);
  }

  return result;
};

export const subscribeToMessages = (callback, limit = 80) => {
  const messagesRef = query(ref(db, 'messages'), limitToLast(limit));
  return onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    const msgs = Object.entries(data).map(([id, val]) => ({
      id,
      ...val,
      timestamp: val.createdAt || 0,
    })).sort((a, b) => a.timestamp - b.timestamp);
    callback(msgs);
  });
};

// ── Background Chat Notification Listener ──
// Listens for new messages and shows local notifications
// when they come from someone other than the current user
let lastKnownMessageCount = -1;
let bgListenerActive = false;

export const startBackgroundChatListener = (currentUserName) => {
  if (bgListenerActive) return; // Prevent duplicates
  bgListenerActive = true;

  const messagesRef = query(ref(db, 'messages'), limitToLast(1));

  onValue(messagesRef, async (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const msgs = Object.values(data);
    const latestMsg = msgs[0];

    // Skip if it's our own message
    if (!latestMsg || latestMsg.sender === currentUserName) return;

    // Skip on initial load (don't notify for old messages)
    if (lastKnownMessageCount === -1) {
      lastKnownMessageCount = Date.now();
      return;
    }

    // Only notify for messages created after we started listening
    const msgTime = latestMsg.createdAt || 0;
    if (msgTime <= lastKnownMessageCount) return;
    lastKnownMessageCount = msgTime;

    // Show local notification
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({
        notifications: [{
          title: `💕 ${latestMsg.sender}`,
          body: latestMsg.text || 'Sent you a message',
          id: Math.floor(Math.random() * 100000),
          schedule: { at: new Date(Date.now() + 500) },
          sound: 'default',
          channelId: 'marshmallow_chat',
          extra: { type: 'shared_chat' },
        }],
      });
    } catch (e) {
      console.log('Local notification error:', e);
    }

    // Also vibrate
    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.vibrate({ duration: 300 });
    } catch {}
  });
};

export { db };
