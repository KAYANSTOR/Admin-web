# تقرير تكامل Firebase لتطبيق Android

بناءً على طلبك، قمت باستخراج كافة بيانات الربط والإعدادات من مشروع لوحة التحكم الحالي (NetCard Pro Admin Dashboard) لكي يتوافق تطبيق الـ Android بشكل كامل مع نفس قاعدة البيانات، دون إجراء أي تعديل على المشروع الحالي.

## 1. Firebase Project
* **Project ID:** `krotek-e768b` (المستخدم فعلياً في كود الويب الحالي)
* **Project Name:** krotek-e768b
* **Project Number:** `60772250353`
* *(ملاحظة داخلية: توجد إعدادات بيئة خاصة بـ AI Studio تشير إلى قاعدة بيانات `ai-studio-bb51084d-8c9b-4f35-abff-6a907c8b1e03` داخل مشروع `gen-lang-client-0070147748`، ولكن الكود المصدري للوحة التحكم يقرأ ويكتب من `krotek-e768b`، لذا تم اعتماده لكونه قاعدة البيانات الفعلية التي تتعامل معها الواجهة).*

## 2. Android Firebase Configuration
* **هل يوجد ملف `google-services.json`؟** لا، غير موجود في بيئة العمل الحالية. 
* **الإجراء المطلوب:** يجب على مطور الأندرويد الدخول إلى إعدادات مشروع `krotek-e768b` في منصة Firebase، وإضافة تطبيق Android جديد، ثم تحميل ملف `google-services.json` ووضعه في مسار `app/` داخل مشروع الأندرويد الخاص به.

## 3. Firebase Authentication
* **Email/Password Authentication:** نعم، مفعّل.
* **طرق تسجيل الدخول الأخرى:** غير مستخدمة في الكود الحالي (فقط الإيميل وكلمة المرور).
* **آلية الربط مع قاعدة البيانات:**
  * تقوم لوحة التحكم بإنشاء الحساب.
  * يتم أخذ الـ `UID` الناتج عن نجاح المصادقة (Auth).
  * يُستخدم هذا الـ `UID` كمعرّف للوثيقة (Document ID) عند إنشاء ملف المستخدم في مسار `users/{userId}`.
  * **تأكيد:** `userId` في قاعدة البيانات هو نفسه `Firebase Auth UID`.

## 4. Firestore
تم فحص الكود المصدري للوحة التحكم، والهيكل الفعلي المتطابق مع مواصفات التطبيق هو كالتالي:

* **المسار الأول (إعدادات النظام):**
  * **Collection:** `app_settings`
  * **Document:** `global_config`
  * **الحقول:**
    * `is_app_active` (Boolean)
    * `maintenance_message` (String)
* **المسار الثاني (بيانات المستخدم/صاحب الشبكة):**
  * **Collection:** `users`
  * **Document:** `{userId}` (وهو الـ Auth UID)
  * **الحقول:**
    * `is_active` (Boolean)
    * `subscription_end_date` (Number - Epoch milliseconds) 
    * `warning_message` (String)
    * `commission_rate` (Number)
    * `role` (String - يحمل قيمة 'NETWORK_OWNER')
* **المسار الثالث (مبيعات الشبكات):**
  * **Collection:** `networks`
  * **Document:** `{userId}`
  * **Subcollection:** `sales`
  * **Document:** `{saleId}`
  * لوحة التحكم لا تكتب في هذا المسار إطلاقاً، بل تستخدم `collectionGroup('sales')` لقراءة جميع المبيعات المرفوعة من تطبيق الأندرويد.

## 5. Firestore Security Rules
* **حالة القواعد الحالية (Security Rules):**
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
* **التحليل والمشاكل (الثغرات):**
  * ماذا يستطيع Android قراءته/كتابته؟ **أي شيء** طالما المستخدم مسجل دخوله.
  * ماذا تستطيع لوحة التحكم قراءته/كتابته؟ **أي شيء**.
  * هل توجد قواعد تمنع مستخدم من الوصول لبيانات مستخدم آخر؟ **لا يوجد**.
  * هل توجد قواعد تمنع تعديل الحقول الحساسة (`is_active`, `commission_rate` وغيرها)؟ **لا يوجد**. 
  * **النتيجة:** القواعد الحالية في مرحلة الـ Development فقط وغير آمنة للإنتاج (Production). أي مستخدم مسجل دخول من تطبيق الأندرويد يستطيع تعديل نسبة عمولته وتفعيل حسابه بنفسه إن كان يملك المعرفة التقنية. يجب كتابة قواعد أمان صارمة لاحقاً.

## 6. Required Android Integration (ANDROID_FIREBASE_INTEGRATION)
*(سيتم وضع هذا القسم بشكله النهائي لنسخه للمطور في نهاية التقرير)*

## 7. Data Contract (جدول المواصفات الفنية)

| Purpose | Firestore Path | Read/Write (Android) | Fields / Data Types |
|---------|----------------|----------------------|----------------------|
| Global settings | `app_settings/global_config` | Read Only | `is_app_active` (Boolean)<br>`maintenance_message` (String) |
| User Profile & Subscription | `users/{userId}` | Read Only | `is_active` (Boolean)<br>`subscription_end_date` (Number - Epoch MS)<br>`warning_message` (String)<br>`commission_rate` (Number) |
| Sales sync | `networks/{userId}/sales/{saleId}` | Write / Read | `saleId` (String)<br>`faceValue` (Number)<br>`createdAt` (Number - Epoch MS)<br>`saleType` (String: 'POS' or 'DIRECT')<br>وغيرها حسب المواصفات المطلوبة مسبقاً. |

---

# COPY_TO_ANDROID_DEVELOPER

### 📱 Android Firebase Integration Requirements

مرحباً، إليك التفاصيل التقنية النهائية لربط تطبيق الأندرويد (NetCard Pro) بقاعدة بيانات Firebase الخاصة بلوحة التحكم:

#### 1. المشروع والمصادقة (Firebase Project & Auth)
- **Firebase Project ID:** `krotek-e768b`
- **Authentication:** يجب تفعيل تسجيل الدخول بواسطة (Email & Password). 
- لوحة التحكم ستقوم بإنشاء الحسابات وتزويد المستخدمين بها. لا تقم ببرمجة شاشة "إنشاء حساب" داخل التطبيق.
- المتغير `userId` الذي ستستخدمه في كل مسارات قاعدة البيانات هو نفسه `currentUser.uid` القادم من Firebase Auth.
- يرجى استخراج ملف `google-services.json` الخاص بهذا المشروع من لوحة تحكم Firebase ووضعه في مسار `app/` الخاص بك.

#### 2. الهيكلة الفعليّة لقاعدة البيانات (Data Contract & Paths)
الرجاء الالتزام الدقيق بهذه المسارات والحقول (أسماء المتغيرات وأنواع البيانات حساسة لحالة الأحرف Type-Sensitive):

**أ. الإعدادات العامة للمنظومة (للقراءة فقط - Read Only):**
- **المسار:** `app_settings/global_config`
- **الحقول المطلوبة (للاستماع للتحديثات - onSnapshot):**
  - `is_app_active` (Boolean)
  - `maintenance_message` (String)

**ب. إعدادات المستخدم / صاحب الشبكة (للقراءة فقط - Read Only):**
- **المسار:** `users/{userId}` *(استبدل userId بالـ Auth UID الخاص بالعميل)*
- **الحقول المطلوبة:**
  - `is_active` (Boolean) - إذا أصبحت false اطرد المستخدم.
  - `commission_rate` (Number) - العمولة المستحقة على العميل.
  - `subscription_end_date` (Number) - بصيغة Epoch Milliseconds. 
  - `warning_message` (String) - رسالة التحذير (3 أيام).

**ج. رفع المبيعات (للكتابة - Write):**
- **المسار:** `networks/{userId}/sales/{saleId}`
- لوحة التحكم تقوم بقراءة المبيعات من جميع الشبكات عبر `collectionGroup('sales')` وتعتمد على الحقول التالية أساسياً لحساب الإحصائيات:
  - `faceValue` (Number) - القيمة الاسمية للكرت.
  - `createdAt` (Number) - تاريخ البيع بصيغة Epoch Milliseconds.
  - `saleType` (String) - قيمتها إما `"POS"` أو `"DIRECT"`.
  - الرجاء رفع باقي الحقول المذكورة في مستند المتطلبات مثل `transactionId`, `customerId`, `commission` ... إلخ داخل هذا المسار.

#### 3. الصلاحيات (Security Rules)
حالياً قواعد الأمان تسمح بالقراءة والكتابة لأي مستخدم مسجل دخوله (`request.auth != null`). يمكنك المضي قدماً في ربط وكتابة المبيعات بسلام، وسيتم تحديث وحماية القواعد لاحقاً لمنع الكتابة العكسية من التطبيق إلى مسار `users` أو `app_settings`.
