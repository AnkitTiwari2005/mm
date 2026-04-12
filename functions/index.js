// ═══════════════════════════════════════════════
//  Marshmallow Cloud Functions — Push Notifications 💌
//  Triggers on new shared chat messages and sends
//  FCM push notifications to the partner's device
// ═══════════════════════════════════════════════

const { onValueCreated } = require("firebase-functions/v2/database");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getDatabase } = require("firebase-admin/database");

initializeApp();

// Triggered when a new message is added to the shared chat
exports.sendChatNotification = onValueCreated(
  {
    ref: "/messages/{messageId}",
    region: "us-central1",
  },
  async (event) => {
    const message = event.data.val();
    if (!message || !message.sender || !message.text) {
      console.log("Invalid message data, skipping notification");
      return null;
    }

    const senderName = message.sender;
    const messageText = message.text;

    console.log(`New message from ${senderName}: ${messageText}`);

    try {
      // Get all registered device tokens
      const db = getDatabase();
      const tokensSnapshot = await db.ref("/fcmTokens").once("value");
      const tokensData = tokensSnapshot.val();

      if (!tokensData) {
        console.log("No FCM tokens registered");
        return null;
      }

      // Build list of tokens to notify (exclude sender's token)
      const tokensToNotify = [];
      const tokenKeys = [];

      Object.entries(tokensData).forEach(([key, data]) => {
        // Don't notify the sender
        if (data.userName !== senderName && data.token) {
          tokensToNotify.push(data.token);
          tokenKeys.push(key);
        }
      });

      if (tokensToNotify.length === 0) {
        console.log("No tokens to notify (sender is the only registered user)");
        return null;
      }

      // Build the FCM notification payload
      const payload = {
        notification: {
          title: `💕 ${senderName}`,
          body: messageText.length > 100
            ? messageText.substring(0, 97) + "..."
            : messageText,
        },
        data: {
          type: "shared_chat",
          sender: senderName,
          click_action: "FLUTTER_NOTIFICATION_CLICK", // Opens app on tap
        },
        android: {
          priority: "high",
          notification: {
            channelId: "marshmallow_chat",
            icon: "ic_launcher",
            color: "#E879A2",
            sound: "default",
          },
        },
      };

      // Send to each token
      const sendPromises = tokensToNotify.map((token) =>
        getMessaging()
          .send({ ...payload, token })
          .catch((error) => {
            console.error(`Failed to send to token: ${error.code}`);
            // Remove invalid tokens
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              const idx = tokensToNotify.indexOf(token);
              if (idx >= 0) {
                db.ref(`/fcmTokens/${tokenKeys[idx]}`).remove();
                console.log(`Removed invalid token: ${tokenKeys[idx]}`);
              }
            }
            return null;
          })
      );

      const results = await Promise.all(sendPromises);
      const successCount = results.filter((r) => r !== null).length;
      console.log(
        `Sent ${successCount}/${tokensToNotify.length} notifications`
      );

      return null;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  }
);
