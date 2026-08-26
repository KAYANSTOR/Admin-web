import { Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * أقصى عدد أيام يُسمح للتطبيق بمنحه لنفسه كفترة تجريبية عند التسجيل الذاتي.
 * هذا الرقم يجب أن يطابق (أو يكون أكبر من) طول الفترة التجريبية المضبوطة فعلياً
 * داخل تطبيق الأندرويد. القيمة هنا "سقف أمان" فقط تمنع التلاعب المباشر بالطلب،
 * راجع أيضاً الشرط المطابق في firestore.rules.
 */
export const MAX_SELF_REGISTRATION_TRIAL_DAYS = 14;

/**
 * دليل.txt يحدد subscription_end_date كـ Firestore Timestamp، لكن نسخاً سابقة
 * من هذه اللوحة كانت تكتبه كرقم عادي (Epoch Milliseconds). هذه الدالة تتعامل
 * مع الشكلين معاً حتى لا تنكسر بيانات العملاء القدامى الموجودة فعلياً في القاعدة.
 */
export function endDateToMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value instanceof Timestamp) return value.toMillis();
  const maybeTimestampLike = value as { toMillis?: () => number; seconds?: number };
  if (typeof maybeTimestampLike?.toMillis === 'function') return maybeTimestampLike.toMillis();
  if (typeof maybeTimestampLike?.seconds === 'number') return maybeTimestampLike.seconds * 1000;
  return 0;
}

export function endDateToDate(value: unknown): Date | null {
  const ms = endDateToMillis(value);
  return ms > 0 ? new Date(ms) : null;
}

export function isSubscriptionExpired(value: unknown): boolean {
  const ms = endDateToMillis(value);
  return ms > 0 && ms < Date.now();
}

/** عدد الأيام المتبقية (يقرّب لأقرب يوم أعلى). يرجع 0 إذا لم يوجد تاريخ. */
export function daysRemaining(value: unknown): number {
  const ms = endDateToMillis(value);
  if (!ms) return 0;
  return Math.ceil((ms - Date.now()) / (24 * 60 * 60 * 1000));
}

/** يبني Timestamp صحيح (كما يتطلب دليل.txt) لعدد أيام معين بدءاً من الآن. */
export function timestampFromDaysFromNow(days: number): Timestamp {
  return Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000);
}

/** يبني Timestamp من رقم ميلي ثانية مباشر (مفيد عند "تمديد" تاريخ موجود مسبقاً). */
export function timestampFromMillis(ms: number): Timestamp {
  return Timestamp.fromMillis(ms);
}

export function isTrialAccount(client: any): boolean {
  return client?.account_type === 'TRIAL';
}

/**
 * تحويل عميل من "تجريبي" إلى "مفعّل رسمياً": يحدد نسبة العمولة ومدة الاشتراك
 * معاً بعملية واحدة، ويُبقي الحساب نشطاً (is_active) حتى لا يُطرد من التطبيق.
 */
export async function activateTrialAccount(uid: string, days: number, commissionRatePercent: number) {
  await updateDoc(doc(db, 'users', uid), {
    account_type: 'PAID',
    commission_rate: commissionRatePercent,
    subscription_end_date: timestampFromDaysFromNow(days),
    is_active: true,
    warning_message: '',
  });
}
