import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PricingCancelPage() {
  return (
    <div className="flex-1 bg-slate-950 flex items-center justify-center py-20 px-4 min-h-[80vh]">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Đã Hủy Thanh Toán</h2>
          <p className="text-slate-400 mb-8">
            Quá trình thanh toán đã bị hủy. Tài khoản của bạn chưa bị trừ tiền.
          </p>
          <Link
            href="/pricing"
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Quay lại chọn gói
          </Link>
        </div>
      </div>
    </div>
  );
}
