'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code, Globe, Briefcase, Mail } from 'lucide-react';

export default function UserFooter() {
  const pathname = usePathname();

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/collaborator') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/verify')
  ) {
    return null;
  }

  return (
    <footer className="w-full bg-[#0B0F19] pt-16 pb-8 mt-auto border-t-2 border-primary select-none relative overflow-hidden">
      {/* Subtle background gradient glow */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 border-slate-200">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
              <div className="flex items-center justify-center min-w-[32px]">
                <span className="text-[22px] font-black text-primary tracking-tighter leading-none select-none">BLH</span>
              </div>
              <div className="h-8 w-px bg-slate-800 mx-1"></div>
              <div>
                <h2 className="text-[18px] font-black text-white! tracking-tighter leading-none group-hover:text-primary! transition-colors">BitelleLearnHub</h2>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-medium text-justify">
              Nền tảng chia sẻ tri thức về lập trình và phát triển phần mềm,
              kết nối những người cùng đam mê để học hỏi, trao đổi kinh nghiệm,
              cung cấp các hướng dẫn chất lượng và cùng nhau đóng góp những giá trị thiết thực cho cộng đồng công nghệ.
            </p>

            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-slate-850 transition-all">
                <Code className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-slate-850 transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-slate-850 transition-all">
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="space-y-4">
            <h3 className="text-white! font-black uppercase text-sm tracking-widest mb-6">Khám phá</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Trang chủ</Link></li>
              <li><Link href="/blog" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Bài viết mới</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Khóa học</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Tính năng</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-4">
            <h3 className="text-white! font-black uppercase text-sm tracking-widest mb-6">Pháp lý</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-primary text-sm font-medium transition-colors">Bản quyền</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white! font-black uppercase text-sm tracking-widest mb-6">Liên hệ</h3>
            <div className="space-y-4">
              <a href="mailto:huanhoccode24@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-primary transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">huanhoccode24@gmail.com</span>
              </a>
              <p className="text-slate-500 text-xs mt-4">
                Đăng ký nhận tin tức mới nhất từ chúng tôi.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="bg-slate-900 border border-slate-800 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 min-w-0"
                />
                <button className="bg-primary hover:bg-[#d15d3b] text-white rounded-lg px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap shadow-lg shadow-primary/20 cursor-pointer active:scale-95">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} BitelleLearnHub Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <span>Made with ❤️ <span className="text-slate-400 font-black">By Coder Huấn</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
