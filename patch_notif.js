import fs from 'fs';

let content = fs.readFileSync('src/pages/NotificationsManager.tsx', 'utf8');

// Add imports
content = content.replace(
  `import { BellRing, Send, CheckCircle2, MessageSquare, Bell } from 'lucide-react';`,
  `import { BellRing, Send, CheckCircle2, MessageSquare, Bell } from 'lucide-react';\nimport { sendPushNotification } from '../lib/fcm';\nimport { serviceAccount } from '../config/serviceAccount';`
);

// Replace Send logic
content = content.replace(
  `        // Save to a queue in Firestore to keep a log (or for a Cloud Function to pick up)\n        await addDoc(collection(db, 'notifications_queue'), {\n          title: title.trim(),\n          message: message.trim(),\n          target: targetAudience,\n          status: 'sent',\n          createdAt: serverTimestamp()\n        });\n\n        /* \n          // ---------------------------------------------------------\n          // [FCM HTTP v1 API - Client Example]\n          // ---------------------------------------------------------\n          // NOTE: To securely use the HTTP v1 API, you need a short-lived OAuth 2.0 token. \n          // Exposing this token on the frontend is a security risk. \n          // The standard approach is to write to Firestore (like above) and trigger a Cloud Function, \n          // OR call your own secure backend API endpoint that holds the credentials.\n          \n          const fcmEndpoint = \`https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send\`;\n          // const accessToken = await getSecureBackendToken();\n          \n          await fetch(fcmEndpoint, {\n            method: 'POST',\n            headers: {\n              'Authorization': \`Bearer \${accessToken}\`,\n              'Content-Type': 'application/json'\n            },\n            body: JSON.stringify({\n              message: {\n                // Topic matches our dropdown targets (e.g. "ALL", "UNPAID_SUB")\n                topic: targetAudience,\n                notification: {\n                  title: title.trim(),\n                  body: message.trim()\n                }\n              }\n            })\n          });\n        */`,
  `        // 1. Save to a log in Firestore
        await addDoc(collection(db, 'notifications_queue'), {
          title: title.trim(),
          message: message.trim(),
          target: targetAudience,
          status: 'sent_locally',
          createdAt: serverTimestamp()
        });

        // 2. Send directly using FCM HTTP v1 (No backend required)
        if (!serviceAccount || !serviceAccount.client_email) {
          throw new Error('ملف Service Account مفقود! يرجى إضافته في src/config/serviceAccount.ts');
        }
        await sendPushNotification(serviceAccount, targetAudience, title.trim(), message.trim());`
);

fs.writeFileSync('src/pages/NotificationsManager.tsx', content);
