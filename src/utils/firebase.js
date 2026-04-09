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

export const sendMessage = (text, senderName) => {
  const messagesRef = ref(db, 'messages');
  return push(messagesRef, {
    text,
    sender: senderName,
    timestamp: serverTimestamp(),
    createdAt: Date.now(),
  });
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

export { db };
