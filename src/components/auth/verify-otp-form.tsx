'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { AlertCircle, CheckCircle2, RotateCw, LogOut } from 'lucide-react';

export default function VerifyOtpForm({ email }: { email: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const { update } = useSession();
  const canSubmit = code.length === 6 && !isPending && !isResending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Mã xác nhận không chính xác!');
        setIsPending(false);
        return;
      }

      // Cập nhật JWT và dùng hard-redirect để chắc chắn load được trang mới
      await update({ isTwoFactorVerified: true });
      
      const session = await fetch('/api/auth/session').then(res => res.json());
      const isAdmin = session?.user?.role === 'ADMIN';
      
      window.location.href = isAdmin ? '/admin/dashboard' : '/dashboard';
    } catch {
      setError('Đã có lỗi xảy ra! Vui lòng thử lại sau.');
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 md:p-10 rounded-lg border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-medium text-slate-900 mb-3">Xác thực OTP</h2>
        <p className="text-indigo-200 text-sm">
          Mã bảo mật 6 số đã được tự động gửi tới hòm thư <br/>
          <span className="font-medium text-slate-900">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-indigo-100 text-sm font-medium mb-3 text-center">
            Mã bảo vệ
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            disabled={isPending}
            className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all tracking-[0.75em] text-center text-3xl font-bold disabled:opacity-50"
            placeholder="••••••"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {resendSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{resendSuccess}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-4 text-white rounded-lg font-medium transition-all transform flex justify-center items-center gap-2
            ${canSubmit 
              ? 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
              : 'bg-slate-300 cursor-not-allowed shadow-none scale-100'
            }`}
        >
          {isPending ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Xác nhận chuyển hướng <CheckCircle2 className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10 pt-6">
        <button
          type="button"
          disabled={isResending || isPending}
          onClick={async () => {
            setIsResending(true);
            setError('');
            setResendSuccess('');
            const response = await fetch('/api/auth/resend-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
              setError(data.error || 'Không thể gửi lại mã!');
            } else {
              setResendSuccess(data.success);
            }
            setIsResending(false);
          }}
          className="text-indigo-300 text-sm hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
          Gửi lại mã OTP
        </button>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-red-300 text-sm hover:text-red-400 flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất / Quay lại
        </button>
      </div>
    </div>
  );
}

