'use client';

import { useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoginSchema } from '@/validations/auth';
import { signIn } from 'next-auth/react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const LoginForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const email = useWatch({ control: form.control, name: 'email' });
  const password = useWatch({ control: form.control, name: 'password' });
  const canSubmit = email && password && !isPending;

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('');
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Đã xảy ra lỗi đăng nhập!');
          return;
        }

        if (data.redirectTo) {
          window.location.href = data.redirectTo;
        }
      } catch (err) {
        setError('Không thể kết nối tới máy chủ!');
        console.error(err);
      }
    });
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans selection:bg-orange-100 overflow-hidden">

      {/* LEFT SIDE: REFINED FORM SECTION */}
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
          <div className="space-y-1 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-[28px] font-medium text-primary! tracking-tighter leading-tight whitespace-nowrap">
              Chào mừng quay trở lại!
            </h1>
            <p className="text-[14px] text-slate-900 font-medium">Vui lòng nhập thông tin để truy cập hệ thống.</p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center gap-3 py-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-all font-bold text-[13px] text-slate-700 shadow-sm cursor-pointer"
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
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center gap-3 py-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-all font-bold text-[13px] text-slate-700 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-4 text-[13px] text-black before:flex-1 before:h-px before:bg-gray-100 after:flex-1 after:h-px after:bg-gray-100 font-medium mb-8">
            Hoặc dùng email
          </div>

          {/* Form Section */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {/* FLOATING LABEL EMAIL */}
            <div className="relative">
              <input
                {...form.register('email')}
                disabled={isPending}
                id="email"
                type="email"
                placeholder=" "
                className="peer w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[8px] text-slate-900 font-medium focus:border-primary focus:ring-0 transition-all outline-none"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-slate-400 font-medium transition-all pointer-events-none
                           peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary 
                           peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary"
              >
                Email
              </label>
              {form.formState.errors.email && (
                <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* FLOATING LABEL PASSWORD */}
            <div className="relative">
              <input
                {...form.register('password')}
                disabled={isPending}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder=" "
                className="peer w-full px-5 py-4 bg-transparent border border-gray-200 rounded-[8px] text-slate-900 font-medium focus:border-primary focus:ring-0 transition-all outline-none"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-slate-400 font-medium transition-all pointer-events-none
                           peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary 
                           peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary"
              >
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {form.formState.errors.password && (
                <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-[8px] bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
                {error}
              </div>
            )}



            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-4.5 text-white font-medium rounded-[8px] transition-all flex items-center justify-center gap-2 text-[16px]
                ${canSubmit
                  ? 'bg-primary hover:opacity-90 shadow-xl shadow-orange-500/25 cursor-pointer active:scale-[0.98]'
                  : 'bg-primary/40 cursor-not-allowed shadow-none'
                }`}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng nhập'}
            </button>
          </form>

          <div className="space-y-4 pt-6 text-[13px] animate-in fade-in duration-1000 delay-300">
            <div className="flex justify-start gap-1">
              <Link href="/forgot-password" className="text-primary hover:underline font-bold">
                Quên Tên đăng nhập?
              </Link>
              <span className="text-slate-900 font-medium">hoặc</span>
              <Link href="/forgot-password" className="text-primary hover:underline font-bold">
                Mật khẩu?
              </Link>
            </div>

            <div className="text-left text-slate-900 font-medium">
              Quý khách chưa đăng ký tài khoản? <Link href="/register" className="text-primary hover:underline font-bold">Đăng ký ngay</Link>
            </div>
          </div>
        </div>


      </div>

      {/* RIGHT SIDE: PREMIUM ILLUSTRATION SECTION */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden h-full flex-col justify-center items-start">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px]"></div>

        <Image
          src="/images/Gemini_Generated_Image_cs5j11cs5j11cs5j.png"
          alt="Login Illustration"
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
