'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Crown, Check, Zap, Star, Loader2 } from 'lucide-react';
import axios from 'axios';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function PricingPage() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<'PRO' | 'VIP' | null>(null);

  const handleCheckout = async (planId: 'PRO' | 'VIP', price: string) => {
    if (!session) {
      alert('Vui lòng đăng nhập trước khi đăng ký gói!');
      return;
    }
    if (session.user.role === planId) {
      alert('Bạn đang sử dụng gói này rồi!');
      return;
    }

    try {
      setLoadingPlan(planId);
      const res = await axios.post('/api/stripe/checkout', {
        planId,
        price,
      });
      if (res.data.url) {
        window.location.assign(res.data.url);
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi tạo phiên thanh toán.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'PRO',
      name: 'PRO',
      price: '50.000đ',
      period: '/tháng',
      description: 'Lý tưởng cho người dùng muốn mở rộng kiến thức.',
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      features: [
        'Xem tất cả bài viết nổi bật',
        'Bình luận ưu tiên',
        'Huy hiệu PRO trên avatar',
        'Không quảng cáo'
      ],
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20'
    },
    {
      id: 'VIP',
      name: 'VIP',
      price: '100.000đ',
      period: '/tháng',
      description: 'Trải nghiệm cao cấp nhất với mọi đặc quyền.',
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      features: [
        'Mọi đặc quyền của gói PRO',
        'Truy cập khóa học độc quyền',
        'Tải mã nguồn mẫu bài viết',
        'Huy hiệu VIP siêu cấp',
        'Hỗ trợ 1-1 qua email'
      ],
      color: 'from-yellow-400 to-yellow-600',
      shadow: 'shadow-yellow-500/20',
      popular: true
    }
  ];

  return (
    <div className="flex-1 bg-slate-950 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-10">
          <Breadcrumb items={[{ label: 'Bảng giá' }]} />
        </div>
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Nâng cấp <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-yellow-600">Trải nghiệm</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Đăng ký thành viên trả phí để mở khóa các bài viết chất lượng cao và nhiều đặc quyền hấp dẫn khác.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative bg-slate-900 rounded-3xl border ${plan.popular ? 'border-yellow-500/50' : 'border-slate-800'} p-8 flex flex-col hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl ${plan.shadow} animate-in fade-in slide-in-from-bottom-8 duration-700 delay-${index * 100}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-yellow-400 to-yellow-600 text-yellow-950 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3" /> Được yêu thích nhất
                </div>
              )}

              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 font-medium">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-500 font-bold" />
                    </div>
                    <span className="text-slate-300 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id as 'PRO' | 'VIP', plan.price)}
                disabled={loadingPlan !== null}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] bg-linear-to-r ${plan.color} flex items-center justify-center gap-2`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang chuyển hướng...
                  </>
                ) : (
                  'Đăng ký ngay'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
