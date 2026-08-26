# مراجعة ما قبل التنفيذ (Pre-Implementation Audit)

## ملخص الحالة الحالية
تم إجراء فحص شامل للمشروع (Frontend, Firebase Configuration, Routes, Pages) للتحقق من التوافق مع دليل التكامل `دليل.txt` والخطة المعتمدة.

## 1. ما هو موجود ويعمل:
- **نظام التوجيه (Routing)** باستخدام React Router يعمل بشكل صحيح.
- **إدارة الحالة والمصادقة (AuthContext)** للمديرين والموظفين تعمل عبر Firebase Auth (تعتمد على Email = Phone + @kayansoft.com).
- **تصميم الواجهات (UI)** متجاوب ومبني باستخدام Tailwind CSS وهو مصمم بشكل ممتاز ولا يحتاج لأي تعديل جذري.
- **شاشة المبيعات (Sales)** تقرأ بالفعل من `collectionGroup('sales')` وهذا يتوافق جزئياً مع المتطلبات، لكن يجب التأكد من تطابق المخطط.
- **شاشة الإعدادات (SystemSettings)** متصلة بـ `app_settings/global_config` وتدير (is_app_active, Banners, WebView_Config, Current_Popup).

## 2. ما هو خاص بـ "السيريالات" ويجب حذفه (Serial System):
نظام السيريالات معزول نسبياً ولكنه متجذر في عدة أماكن:
- `src/pages/Serials.tsx` (يجب حذفه)
- `src/pages/CreateSerial.tsx` (يجب حذفه)
- التوجيهات (Routes) الخاصة بها في `App.tsx`
- قائمة الإجراءات السريعة في `Dashboard.tsx` (إضافة جهاز)
- الروابط في القائمة الجانبية `AppLayout.tsx`
- صلاحية `serials` الممنوحة في `AuthContext.tsx`، `Clients.tsx`، و `Employees.tsx` (يجب إزالتها من مصفوفات الصلاحيات).

## 3. ما يخص "الاشتراكات" (Subscriptions):
- صفحة `Subscriptions.tsx` تقرأ حالياً من `users/{UID}` وحقل `subscription_end_date` وهذا **متوافق مع الخطة** (لا يوجد Collection مستقل للاشتراكات القديمة).
- صفحة `ClientProfile.tsx` تحتوي بالفعل على منطق تجديد الاشتراك (تقوم بتحديث `users/{UID}`).
- **الخلاصة:** نظام الاشتراكات الحالي متوافق بنسبة كبيرة جداً مع الخطة، ولن يحتاج إلا إلى مراجعة دقيقة للحقول لضمان تطابقها تماماً (is_active, subscription_end_date, warning_message).

## 4. ما هو ناقص ويجب إضافته / إصلاحه:
- **عند إنشاء عميل جديد (`handleCreateClient` في `Clients.tsx`):**
  - الكود الحالي ينشئ حساب Auth، وينشئ وثيقة `users/{UID}`، ولكنه **لا ينشئ** مسار الشبكة الإلزامي `networks/{UID}/_metadata/info`. (يجب إضافته).
  - بعض الحقول المضافة مثل `isActive` و `is_active` مكررة (يجب توحيدها إلى `is_active` أو تحديث الكود للتعامل بشكل صحيح مع Android schema).
- **نظام الإشعارات (Notifications):**
  - الكود الحالي في `NotificationsManager.tsx` يكتب الإشعارات المنبثقة بشكل صحيح، ولكن يجب التحقق من كتابة إشعارات المستخدمين الفردية إلى `users/{UID}/notifications/{notificationId}` وإشعارات النظام إلى `app_settings/global_config/notifications/{notificationId}`.
- **المبيعات والعمولات:**
  - هيكل المبيعات يحتاج إلى التأكد من أنه يعتمد على المبيعات الناجحة (`COMPLETED`) عند حساب العمولة (`commission_rate`).
  
## 5. قواعد الأمان (Security Rules):
- يجب مراجعة قواعد `firestore.rules` وتحديثها لضمان أن العميل (NETWORK_OWNER) يمتلك صلاحيات قراءة/كتابة محددة جداً فقط لـ `networks/{UID}` الخاصة به، وأن `ADMIN` يمتلك صلاحيات مطلقة، مع إضافة قواعد لـ `STAFF` بناءً على الحقل `permissions`.

## الخطوات التالية:
بناءً على هذه المراجعة، الواجهات الحالية (UI) **مجمدة (Frozen)** وسيتم الانتقال إلى المرحلة الثالثة لحذف نظام السيريالات بالكامل، ثم ربط بقية الوظائف تماماً بهيكل Android.
