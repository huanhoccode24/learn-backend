'use client';

import React from 'react';
import { Bell, Search, Menu, User, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    image?: string | null;
  };
  onMenuClick?: () => void;
}

export const AdminHeader = ({ user, onMenuClick }: AdminHeaderProps) => {
  const pathname = usePathname();
  
  // Logic tạo breadcrumbs từ pathname
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href };
  });

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Bên trái: Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors lg:hidden cursor-pointer"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-gray-500" />
        </button>
        
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
              <Link 
                href={crumb.href}
                className={`${index === breadcrumbs.length - 1 ? 'text-black font-black' : 'text-gray-400 hover:text-black'} transition-colors`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Bên phải: Search + Notifications + User */}
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block group">
          <Input 
            placeholder="Search here..." 
            className="w-48 h-9 pl-9 bg-gray-50 border border-gray-100 rounded-[10px] text-xs focus:ring-rose-500/10 group-hover:bg-gray-100 transition-all text-black"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        </div>

        <button 
          className="relative p-2 hover:bg-gray-50 rounded-full transition-colors group"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5 text-gray-500 group-hover:text-rose-500 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
            2
          </span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-black leading-none">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center overflow-hidden shadow-sm">
            {user?.image ? (
              <Image src={user.image} alt="Avatar" width={36} height={36} className="object-cover" />
            ) : (
              <User className="w-5 h-5 text-rose-500" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Mock Input component if needed or use from UI
import { Input } from '@/components/ui';
