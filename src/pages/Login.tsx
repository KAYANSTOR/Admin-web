import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Phone, Lock } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, errorMsg } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || pin.length !== 4) return;
    try {
      setIsLoading(true);
      await login('', phone, pin);
      navigate('/dashboard');
    } catch (err: any) {
      // Error is handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-app-bg">
      <div className="w-full max-w-[400px] px-8">
        <div className="bg-surface rounded-[24px] border border-gray-200 w-full p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">KayanSoft</h1>
            <p className="text-gray-500 text-sm font-medium">تسجيل الدخول لمركز الإدارة</p>
          </div>

          {errorMsg && (
            <div className="mb-6 text-error text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  className="w-full pr-10 pl-3 py-3.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all bg-transparent text-right text-text-primary text-[15px] placeholder:text-gray-400"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف"
                />
              </div>
            </div>

            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={4}
                  className="w-full pr-10 pl-3 py-3.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all bg-transparent text-center tracking-[0.5em] text-text-primary text-[15px] placeholder:tracking-normal placeholder:text-right placeholder:text-gray-400"
                  dir="ltr"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="رمز الدخول (4 أرقام)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-variant text-white font-bold rounded-xl transition-colors flex items-center justify-center h-[50px] text-[16px]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'دخول'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
