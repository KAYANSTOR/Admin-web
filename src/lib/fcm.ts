import { SignJWT, importPKCS8 } from 'jose';

// دالة لتوليد Access Token باستخدام بيانات Service Account
export async function getFcmAccessToken(serviceAccount: any): Promise<string> {
  const { client_email, private_key } = serviceAccount;
  
  if (!client_email || !private_key) {
    throw new Error('بيانات Service Account غير مكتملة. يرجى التأكد من لصق الملف بشكل صحيح.');
  }

  const alg = 'RS256';
  // تجهيز المفتاح السري
  const privateKey = await importPKCS8(private_key, alg);
  
  const now = Math.floor(Date.now() / 1000);
  
  // إنشاء التوكن (JWT) وتوقيعه محلياً في المتصفح
  const jwt = await new SignJWT({
    iss: client_email,
    sub: client_email,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  })
    .setProtectedHeader({ alg, typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  // تبديل التوكن بـ Access Token حقيقي من جوجل
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'فشل في الحصول على Access Token من جوجل.');
  }

  return data.access_token;
}

// دالة لإرسال الإشعار
export async function sendPushNotification(serviceAccount: any, targetTopic: string, title: string, body: string) {
  // 1. الحصول على التوكن
  const accessToken = await getFcmAccessToken(serviceAccount);
  const projectId = serviceAccount.project_id;
  
  // 2. إرسال الإشعار لـ FCM HTTP v1 API
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        topic: targetTopic,
        notification: {
          title: title,
          body: body,
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'فشل إرسال الإشعار.');
  }
  
  return await response.json();
}
