'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button, Input } from '@/components/ui';
import {
  Loader2,
  Filter,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import Image from 'next/image';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
}

const fetchUsers = async (): Promise<AdminUser[]> => {
  const { data } = await axios.get('/api/admin/users');
  return data.success || [];
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  });

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-black bg-white min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#E96E4A] mb-4" strokeWidth={1.5} />
        <p className="text-sm font-normal tracking-wide text-gray-400">Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans antialiased px-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pt-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-black! tracking-tight">Người dùng</h1>
          <p className="text-[14px] text-gray-400 font-normal">Quản lý danh sách người dùng và quyền hạn truy cập hệ thống</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Button className="bg-[#E96E4A]! hover:opacity-90 text-white! px-6 h-[44px] rounded-[10px] text-[13px] font-bold transition-all shadow-none">
            Add User
          </Button>
        </div>
      </div>

      {/* Top Actions: Search & Filter */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-[320px]">
          <Input
            placeholder="Search users..."
            className="bg-white border-[#E96E4A]! h-[44px] pl-4 pr-4 rounded-[10px] text-[14px] text-black font-normal placeholder:text-gray-300 focus:border-[#E96E4A] outline-none w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-[44px] px-4 rounded-[10px] border-[#E96E4A]! text-black font-normal text-[13px] gap-2 hover:bg-orange-50 transition-all shrink-0">
            <Filter className="w-4 h-4 text-[#E96E4A]" /> Filter
          </Button>
          <Button variant="outline" className="h-[44px] px-4 rounded-[10px] border-[#E96E4A]! text-black font-normal text-[13px] gap-2 hover:bg-orange-50 transition-all shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-[#E96E4A]" /> Excel
          </Button>
          <Button variant="outline" className="h-[44px] px-4 rounded-[10px] border-[#E96E4A]! text-black font-normal text-[13px] gap-2 hover:bg-orange-50 transition-all shrink-0">
            <FileText className="w-4 h-4 text-[#E96E4A]" /> PDF
          </Button>
        </div>
      </div>

      {/* Table Section - Mirroring Banner Style */}
      <div className="border border-[#E96E4A] rounded-[10px] overflow-hidden bg-white shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E96E4A] text-white">
                <th className="px-6 py-4 text-[15px] font-normal tracking-wide w-[250px]">User</th>
                <th className="px-6 py-4 text-[15px] font-normal tracking-wide">Email</th>
                <th className="px-6 py-4 text-[15px] font-normal tracking-wide text-center">Role</th>
                <th className="px-6 py-4 text-[15px] font-normal tracking-wide text-center">Joined</th>
                <th className="px-6 py-4 text-[15px] font-normal tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E96E4A]">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-orange-50/30 transition-all duration-200 group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-[48px] h-[48px] rounded-[10px] overflow-hidden shrink-0 border border-[#E96E4A] bg-gray-50">
                        {user.image ? (
                          <Image src={user.image} alt={user.name || 'U'} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[15px] font-normal text-[#E96E4A] bg-orange-50">
                            {getInitials(user.name)}
                          </div>
                        )}
                      </div>
                      <span className="text-[14px] font-normal text-black">{user.name || "Anonymous"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[14px] text-black font-normal">{user.email}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[13px] font-normal text-black`}>
                      {user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-[14px] text-black font-normal">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-[14px] text-gray-400 group-hover:text-black font-normal transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-[#E96E4A] p-6 flex items-center justify-between bg-white">
          <p className="text-[13px] text-gray-400 font-normal">
            Showing <span className="text-black font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-black font-bold">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-black font-bold">{filteredUsers.length}</span> users
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-[10px] bg-gray-50 text-black text-[12px] font-normal hover:bg-orange-50 transition-all disabled:opacity-50 border border-[#E96E4A]/30"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[34px] h-[34px] rounded-[10px] text-[12px] font-normal transition-all ${currentPage === page
                    ? 'bg-[#E96E4A] text-white'
                    : 'text-black hover:bg-orange-50'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-[10px] bg-gray-50 text-black text-[12px] font-normal hover:bg-orange-50 transition-all disabled:opacity-50 border border-[#E96E4A]/30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
