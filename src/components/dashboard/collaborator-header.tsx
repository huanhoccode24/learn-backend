'use client';

import React, { useState } from 'react';
import { Bell, Search, Menu, User, ChevronRight, Check, Trash2, XCircle, CheckCircle2, Clock } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'POST_APPROVED' | 'POST_REJECTED' | 'POST_REMOVED';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  postId?: string;
}

interface CollaboratorHeaderProps {
  user?: {
    name?: string | null;
    image?: string | null;
  };
  onMenuClick?: () => void;
}

export const CollaboratorHeader = ({ user, onMenuClick }: CollaboratorHeaderProps) => {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();
  
  // Logic tạo breadcrumbs từ pathname
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href };
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axios.get('/api/notifications');
      return data;
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await axios.patch('/api/notifications', { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'POST_APPROVED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'POST_REJECTED': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'POST_REMOVED': return <Trash2 className="w-4 h-4 text-amber-500" />;
      case 'COLLABORATOR_INVITED': return <User className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Bên trái: Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-50 rounded-[8px] transition-colors lg:hidden cursor-pointer"
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
                className={`${index === breadcrumbs.length - 1 ? 'text-black! font-black' : 'text-gray-400 hover:text-black'} transition-colors`}
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
            className="w-48 h-9 pl-9 bg-gray-50 border border-primary! rounded-[8px] text-xs focus:ring-primary/10 group-hover:bg-gray-100 transition-all text-black"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 hover:bg-gray-50 rounded-full transition-colors group cursor-pointer ${showNotifications ? 'bg-gray-50 text-rose-500' : ''}`}
            aria-label="Thông báo"
          >
            <Bell className={`w-5 h-5 ${showNotifications ? 'text-rose-500' : 'text-gray-500'} group-hover:text-rose-500 transition-colors`} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-3 w-[320px] md:w-[380px] bg-white border border-gray-100 rounded-[16px] shadow-2xl shadow-black/5 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <h3 className="text-sm font-black text-black">Thông báo</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllReadMutation.mutate()}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Đánh dấu đã đọc
                    </button>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-rose-50/20' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            n.type === 'POST_APPROVED' ? 'bg-emerald-50' : 
                            n.type === 'POST_REJECTED' ? 'bg-rose-50' : 'bg-amber-50'
                          }`}>
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className={`text-[13px] leading-tight ${!n.isRead ? 'font-black text-black' : 'font-medium text-gray-700'}`}>
                              {n.title}
                            </p>
                            <p className="text-[12px] text-gray-500 leading-normal line-clamp-2">
                              {n.message}
                            </p>
                            <div className="flex items-center gap-1.5 pt-1">
                              <Clock className="w-3 h-3 text-gray-300" />
                              <span className="text-[10px] text-gray-400 font-medium">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                              </span>
                            </div>
                          </div>
                          {!n.isRead && (
                            <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0 mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                      <Bell className="w-8 h-8 mb-3 opacity-20" strokeWidth={1.5} />
                      <p className="text-xs font-medium">Không có thông báo nào</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50/30 text-center border-t border-gray-50">
                  <Link 
                    href="/collaborator/notifications" 
                    className="text-[11px] font-bold text-gray-500 hover:text-black transition-colors"
                  >
                    Xem tất cả thông báo
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-black leading-none">{user?.name || 'Cộng tác viên'}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Collaborator</p>
          </div>
          <div className="w-9 h-9 rounded-[8px] bg-rose-50 border border-rose-100 flex items-center justify-center overflow-hidden shadow-sm">
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
