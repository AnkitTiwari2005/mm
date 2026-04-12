const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getDatabase } = require("firebase-admin/database");

// Hardcode SA purely for serverless fast deploy
const serviceAccount = {
  "type": "service_account",
  "project_id": "marshmallow-bba0e",
  "private_key_id": "6ec63102f8ef90db63811987e76498c3da285e30",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCvfb0SnDgWSHsx\nZXAXEfTGyujcu614aDeiZDAa8FQfaIJpKSp76p6FHFdzOYqpG+PwafXNec4BuMAx\nV5IZGvii6FrnbFqd7gZn4tN1QlWivjyUPfopCWWVvWmb0vjMZCu1Wq5Elu4fw1aF\n/tMveXJJUZJxkHZX0Bjp7VzKX4wDzhqjaZIhSR+ExBUOvkeP7Y2O9O/+W/BYz9dQ\n8i47d00zOXu8DMjG3VP84ddpHKJPkzf5vune762OZ2U1zL7I0Hnq/2BU20bW4g6K\naNV+kWOFXYk8MlU5XqUvay1ArexpCCaDeiNuVcGBZwJp+VCoS4SWiY1Yyx7/KZjL\nb5kFoj2hAgMBAAECggEABFicyPAEoVQllWhHx7F8lnsGW/ebrOWHWbKpoJQqwC2h\nW69+32tkxkMIvSg72XLw8OZ95XsmlYM04s/ydMPWzCmNHUnBH4PKZbKf1inIt0dm\n9oynpDIo8XW7vqXBnsW9EaBrnBQhFPksbJR+WFDVmlBebCi1zphPMqVr0LD/taUf\nvl+hGECf6VDKOr/e6sNuoNqu3cNxZ38UCAH5FttZ0G7tteDMSeo6S+Dcl0efwBow\nfNxaGS3QHwuv3INT+kEelrdIoDKjLJiC8KQKMZvLsQq7hXDoNIHpKlidQ/GFWIpI\nsbjxMdJim7CgkxiJWhNxxmE4w+yJnkE6dWromLcfAQKBgQDgv5abA/sGvSsFaXmJ\nB14Nd9JvnKmKlNL0E+/DBa3pjYbGBmmZOL5imVC2+ZSMxLkG/ay5QBmZwhbNuiAR\nDMyAA7qfN6tXOWS0t6rxIqAKjCp+K7n49suzRL2JSDHJc1/zopc04pmRppWBo2JC\n8OLStJTWuLCjGvkxnrjKJ1p/gQKBgQDH5Ls4++Q/Drhzkae7F3H0HLlwyPV+WdSu\nx9t+jG/w8fM8mJ/RTz6aTqIi7Vf+FZUQOArSmciDyVknOCNAROMa52/CgcPxboRa\nrTI4wkT+bLJeKy/A6bTWuj3fqTi7Wmx96nTpM124RDiu9ttHTu10gWXyr7XE19Jn\nXlcLz17OIQKBgB17ZHE/S22t4PfbxzKfgcn4fuVfQqpILYgRGXGWzCKICzbs3mtY\nEzlx7TGjecYhhDgTjNXcP794w28HTG+QIz9jvdZnAhX2FGzUbxsktKPNkUFt0P6E\nuWHx0X8xtj474UlfecBZPVXq6U/RM/GeEdMcFy43mgw7XJcSwCDcmrWBAoGAFFKd\n8koxx3Nwr1dErVHR5Rayh9P2mZT6eZaaK0CN9Po0V5nQzc/3tmp+M3zb8FozYIXC\nG+1EpJlo9gLQGq2mRUr4Ytccm8Q3spxfOcQOjatxav+LCFr6ZsZimgWzXeDwnNCk\neD0frydIeAli+9n7bFfnjIfuvAeRPa8qvGml4uECgYBEeGNchlQgWS7r8Vj/ATdC\nyxO0DNLMomlNs7118XrL5ars2Qb7aHbUXQQFHN/ppAfVmpxHSykYMG+sYGIEpEPz\nAu0MY1GsN+6WwzlDqjc8Bf+Z0Nvqz9CmptKffmn/O/JT3Qm53winXjcmg15ZwOeL\naw30xoG2Uo+cL/acGJkDdQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@marshmallow-bba0e.iam.gserviceaccount.com",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://marshmallow-bba0e-default-rtdb.firebaseio.com",
    });
  }

  const { senderName, messageText } = req.body;
  if (!senderName || !messageText) {
    return res.status(400).json({ error: "Missing senderName or messageText" });
  }

  try {
    const db = getDatabase();
    const tokensSnapshot = await db.ref("/fcmTokens").once("value");
    const tokensData = tokensSnapshot.val();

    if (!tokensData) {
      return res.status(200).json({ status: "No tokens registered" });
    }

    const tokensToNotify = [];
    const tokenKeys = [];

    Object.entries(tokensData).forEach(([key, data]) => {
      // Don't notify the sender!
      if (data.userName !== senderName && data.token) {
        tokensToNotify.push(data.token);
        tokenKeys.push(key);
      }
    });

    if (tokensToNotify.length === 0) {
      return res.status(200).json({ status: "No eligible recipients" });
    }

    const payload = {
      notification: {
        title: `💕 ${senderName}`,
        body: messageText.length > 100 ? messageText.substring(0, 97) + "..." : messageText,
      },
      data: {
        type: "shared_chat",
        sender: senderName,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
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
      // iOS
      apns: {
         payload: {
             aps: {
                contentAvailable: true,
                sound: "default",
             }
         }
      }
    };

    const sendPromises = tokensToNotify.map((token) =>
      getMessaging()
        .send({ ...payload, token })
        .catch((error) => {
          console.error(`Failed token: ${error.code}`);
          if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            const idx = tokensToNotify.indexOf(token);
            if (idx >= 0) db.ref(`/fcmTokens/${tokenKeys[idx]}`).remove();
          }
          return null;
        })
    );

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r !== null).length;

    return res.status(200).json({ sent: successCount, total: tokensToNotify.length });
  } catch (error) {
    console.error("Vercel FCM Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
