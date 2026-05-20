'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const { update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      router.push('/pricing');
      return;
    }

    const handleAutoActivate = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          router.push('/pricing');
          return;
        }

        // Gọi API xác thực thanh toán và update role
        const res = await fetch('/api/stripe/simulate-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          const data = await res.json();
          // Cập nhật session client
          await update({ role: data.role });
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setError(true);
        setLoading(false);
      }
    };

    handleAutoActivate();
  }, [searchParams, router, update]);

  return (
    <div className="flex-1 bg-slate-950 flex items-center justify-center py-20 px-4 min-h-[80vh]">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-500">
        {loading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6" />
            <h2 className="text-2xl font-black text-white mb-2">Đang xác thực thanh toán...</h2>
            <p className="text-slate-400 text-sm">Vui lòng không đóng trình duyệt, hệ thống đang kiểm tra giao dịch của bạn.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
              <Star className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Xác thực thất bại</h2>
            <p className="text-slate-400 mb-8">Chúng tôi chưa nhận được xác nhận thanh toán từ Stripe. Vui lòng liên hệ hỗ trợ.</p>
            <Link href="/pricing" className="text-indigo-400 font-bold hover:underline">Quay lại</Link>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Thành Công!</h2>
            <p className="text-slate-400 mb-8">
              Tài khoản của bạn đã được nâng cấp. Chào mừng bạn gia nhập cộng đồng hội viên cao cấp!
            </p>

            <Link
              href="/"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Bắt đầu ngay <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
