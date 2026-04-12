// ═══════════════════════════════════════════════
//  Push Notification Manager — Marshmallow 💌
//  Handles FCM token registration and notification
//  listeners using @capacitor/push-notifications
// ═══════════════════════════════════════════════

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { ref, set } from 'firebase/database';
import { db } from './firebase';

// Store FCM token in Firebase RTDB so Cloud Functions can find it
const saveTokenToFirebase = async (token, userName) => {
  try {
    // Use a sanitized version of the username as the key
    const safeKey = (userName || 'anonymous').replace(/[.#$[\]/]/g, '_');
    await set(ref(db, `fcmTokens/${safeKey}`), {
      token,
      userName: userName || 'anonymous',
      updatedAt: Date.now(),
      platform: 'android',
    });
    console.log('✅ FCM token saved to Firebase for:', userName);
  } catch (e) {
    console.error('Failed to save FCM token:', e);
  }
};

// Initialize push notifications
export const initPushNotifications = async (userName) => {
  // Only works on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications not available on web');
    return;
  }

  try {
    // Check current permission status
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    // Register for push notifications
    await PushNotifications.register();

    // Listen for registration success
    PushNotifications.addListener('registration', (token) => {
      console.log('📱 FCM Token:', token.value);
      saveTokenToFirebase(token.value, userName);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('FCM Registration error:', error);
    });

    // Listen for push notifications received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📬 Push received in foreground:', notification);
      // The notification is automatically shown by the system
      // We could also trigger a vibration or in-app banner here
    });

    // Listen for notification taps (user clicked on a notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('👆 Push notification tapped:', notification);
      // Navigate to chat screen — the app will handle this via the router
      // We store a flag that the next render can check
      window.__marshmallow_open_chat = true;
    });

    console.log('✅ Push notifications initialized');
  } catch (e) {
    console.error('Push notification init error:', e);
  }
};
