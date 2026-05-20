'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminUser } from '@/types';
import Image from 'next/image';
import { Mail, Calendar, Loader2, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Input } from '@/components/ui';



const ProviderIcon = ({ provider }: { provider: string }) => {
  const name = provider.toLowerCase();
  if (name === 'google') {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
  }
  if (name === 'github') {
    return (
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    );
  }
  // Fallback cho provider khác
  return (
    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
      {provider}
    </span>
  );
};

const fetchUsers = async (): Promise<AdminUser[]> => {
  const response = await fetch('/api/admin/users');
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Không thể lấy dữ liệu người dùng');
  }
  const data = await response.json();
  return data.success || [];
};

export const AdminView = () => {
  const {
    data: users = [],
    isLoading,
    error
  } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getGradient = (name: string | null) => {
    const gradients = [
      'from-indigo-500 to-purple-500',
      'from-emerald-500 to-teal-500',
      'from-rose-500 to-orange-500',
      'from-blue-500 to-indigo-500',
      'from-pink-500 to-rose-500',
      'from-amber-500 to-yellow-500',
    ];
    const index = name ? name.length % gradients.length : 0;
    return gradients[index];
  };

  // Logic lọc và phân trang
  const filteredUsers = users.filter(u =>
  (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // useEffect để reset page khi searchQuery thay đổi đã được chuyển vào hàm handleSearchChange
  // để tránh lỗi "Calling setState synchronously within an effect"

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="font-bold text-lg">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-red-400">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="font-bold text-lg">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 px-2">
        <h2 className="text-xl font-bold text-black flex items-center gap-3">
          Số lượng thành viên trong hệ thống
          <span className="ml-2 text-xs font-black px-3 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
            {filteredUsers.length} THÀNH VIÊN
          </span>
        </h2>

        <div className="relative w-full md:w-80 group">
          <Input
            className="pl-12 bg-white border-black/10 h-12 rounded-[10px] focus:ring-black/5 transition-all text-sm text-black placeholder:text-gray-400"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110 pointer-events-none z-10">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-black" />
          </div>
        </div>
      </div>

      <Card className="border-black/10 bg-white rounded-[10px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-black/5 text-gray-500">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Người dùng</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Email liên hệ</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Liên kết</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Phân quyền</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Ngày gia nhập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-[10px] flex items-center justify-center overflow-hidden 
                          border border-gray-100 group-hover:border-black transition-all shadow-sm relative
                          ${!user.image ? `bg-linear-to-br ${getGradient(user.name)}` : 'bg-gray-100'}
                        `}>
                          {user.image ? (
                            <Image src={user.image} alt="User Avatar" fill className="object-cover" />
                          ) : (
                            <span className="text-white text-base font-black tracking-tighter">
                              {getInitials(user.name)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-black group-hover:text-black transition-colors">{user.name || "Người dùng ẩn danh"}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">#{user.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-gray-600 group-hover:text-black transition-colors">
                        <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100 group-hover:border-black/10">
                          <Mail className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
                        </div>
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {user.providers && user.providers.length > 0 ? (
                          user.providers.map((provider) => (
                            <div
                              key={provider}
                              className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:border-black hover:bg-white transition-all cursor-default shadow-sm"
                              title={provider.charAt(0).toUpperCase() + provider.slice(1)}
                            >
                              <ProviderIcon provider={provider} />
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Credentials</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-wider border shadow-sm ${user.role === 'ADMIN'
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                        <span className="font-medium text-gray-600 group-hover:text-black transition-colors">{new Date(user.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic font-medium">
                    Không tìm thấy người dùng phù hợp với từ khóa &quot;{searchQuery}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > itemsPerPage && (
          <div className="p-6 bg-gray-50 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest hidden md:block">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:bg-black hover:text-white hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 text-xs font-black rounded-[8px] border transition-all ${currentPage === page
                      ? 'bg-black border-black text-white shadow-lg shadow-black/20'
                      : 'border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-black'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-10 w-10 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-400 hover:bg-black hover:text-white hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
