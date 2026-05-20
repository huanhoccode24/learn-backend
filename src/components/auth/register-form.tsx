'use client';

import { useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RegisterSchema } from '@/validations/auth';
import { signIn } from 'next-auth/react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: '', password: '', name: '', isCollaborator: false },
  });

  const name = useWatch({ control: form.control, name: 'name' });
  const email = useWatch({ control: form.control, name: 'email' });
  const password = useWatch({ control: form.control, name: 'password' });
  const canSubmit = name && email && password && !isPending;

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError('');
    setSuccess('');
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Đã xảy ra lỗi đăng ký!');
          return;
        }

        setSuccess(data.success);
      } catch (err) {
        console.error('Registration error:', err);
        setError('Không thể kết nối tới máy chủ!');
      }
    });
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans selection:bg-orange-100 overflow-hidden">

      {/* LEFT SIDE: REFINED REGISTER FORM */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col p-10 md:px-16 xl:px-24 bg-linear-to-b from-white to-gray-50/30 relative h-full">

        {/* Admin Style Logo */}
        <div className="flex items-center gap-2.5 group cursor-pointer animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-center min-w-[32px]">
            <span className="text-[26px] font-black text-primary! tracking-tighter leading-none select-none">BLH</span>
          </div>
          <div className="h-8 w-px bg-gray-100 mx-1"></div>
          <div>
            <h2 className="text-[20px] font-black text-primary! tracking-tighter leading-none">BitelleLearnHub</h2>
            <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase mt-0.5">Nâng tầm tri thức</p>
          </div>
        </div>

        {/* Main Content Area - Centered Vertically */}
        <div className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto">
          <div className="space-y-2 mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-[28px] font-medium text-primary! tracking-tighter leading-tight whitespace-nowrap block">
              Tạo tài khoản mới cho bạn!
            </h1>
            <p className="text-[14px] text-slate-900 font-medium text-balance">Gia nhập cộng đồng lập trình viên Antigravity ngay hôm nay.</p>
          </div>

          {/* Social Register */}
          <div className="grid grid-cols-2 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center gap-3 py-2.5 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-[13px] text-slate-700 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              onClick={() => signIn('azure-ad', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center gap-3 py-2.5 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-[13px] text-slate-700 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Microsoft
            </button>
          </div>

          <div className="flex items-center gap-4 text-[13px] text-black before:flex-1 before:h-px before:bg-gray-100 after:flex-1 after:h-px after:bg-gray-100 font-medium mb-6">
            Hoặc dùng email
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
              <input
                {...form.register('name')}
                disabled={isPending}
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-lg text-slate-900 font-medium placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input
                {...form.register('email')}
                disabled={isPending}
                type="email"
                placeholder="name@example.com"
                className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-lg text-slate-900 font-medium placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative">
                <input
                  {...form.register('password')}
                  disabled={isPending}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-lg text-slate-900 font-medium placeholder:text-slate-300 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-1 ml-1">
              <input
                type="checkbox"
                {...form.register('isCollaborator')}
                id="isCollaborator"
                className="w-4 h-4 rounded-lg border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isCollaborator" className="text-slate-500 text-[13px] font-medium cursor-pointer select-none">
                Tôi muốn trở thành Cộng tác viên
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold">
                {success} Vui lòng chuyển sang đăng nhập.
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-4 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 mt-2 text-[15px]
                ${canSubmit
                  ? 'bg-primary hover:bg-[#d85d3a] shadow-xl shadow-orange-500/25 cursor-pointer active:scale-[0.98]'
                  : 'bg-primary/40 cursor-not-allowed shadow-none'
                }`}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng ký'}
            </button>
          </form>

          <div className="text-left pt-8 text-[13px] text-slate-900 font-medium animate-in fade-in duration-1000 delay-300">
            Đã có tài khoản? <Link href="/login" className="text-primary hover:underline font-bold">Đăng nhập</Link>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: ILLUSTRATION */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden h-full flex-col justify-center items-start">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px]"></div>

        <Image
          src="/images/Gemini_Generated_Image_cs5j11cs5j11cs5j.png"
          alt="Register Illustration"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="relative z-20 w-full text-left px-20 animate-in fade-in slide-in-from-left-6 duration-1000 delay-300">
          <h3 className="text-[48px] font-black text-primary leading-tight drop-shadow-2xl whitespace-nowrap mb-2">
            Khai phá tiềm năng cùng BitelleLearnHub
          </h3>
          <p className="text-white/90 font-medium text-xl drop-shadow-xl whitespace-nowrap">
            Nền tảng chia sẻ tri thức và kết nối cộng đồng lập trình viên thế hệ mới.
          </p>
        </div>
      </div>

    </div>
  );
};
