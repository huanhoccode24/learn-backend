'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  LogOut,
  X
} from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';

interface CollaboratorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CollaboratorSidebar = ({ isOpen, onClose }: CollaboratorSidebarProps) => {
  const pathname = usePathname();

  const menuItems = [
    {
      group: 'Main',
      items: [
        { name: 'Dashboard', href: '/collaborator/dashboard', icon: LayoutDashboard },
        { name: 'Bài viết của tôi', href: '/collaborator/posts', icon: FileText },
      ]
    },
  ];

  return (
    <aside className={`w-full lg:w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="h-16 px-6 flex items-center justify-center lg:justify-start border-b border-gray-100 gap-2 shrink-0 relative">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center min-w-[32px]">
            <span className="text-[22px] font-black text-primary! tracking-tighter leading-none select-none">BLH</span>
          </div>
          <div className="h-8 w-px bg-gray-100 mx-1"></div>
          <div>
            <h2 className="text-[18px] font-black text-primary! tracking-tighter leading-none">BitelleLearnHub</h2>
            <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase mt-0.5">Collaborator</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-50 rounded-lg lg:hidden transition-colors cursor-pointer absolute right-6 top-1/2 -translate-y-1/2"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 px-4 py-6 space-y-8">
        {menuItems.map((group) => (
          <div key={group.group} className="space-y-4">
            <h3 className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-black!">
              {group.group}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/collaborator/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-[8px] transition-all duration-300 group relative ${isActive
                      ? 'bg-orange-50 text-primary font-bold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                    )}
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-black'}`} />
                    <span className="text-sm tracking-tight">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

      </div>

      <div className="p-4 border-t border-gray-100 shrink-0">
        <LogoutButton className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[8px] text-gray-500 hover:bg-orange-50 hover:text-primary transition-all font-medium justify-start group">
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          <span className="text-sm tracking-tight">Đăng xuất</span>
        </LogoutButton>
      </div>
    </aside>
  );
};
