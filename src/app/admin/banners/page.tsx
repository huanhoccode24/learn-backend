'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button, Input } from '@/components/ui';
import {
  Loader2,
  Trash2,
  Pencil,
  Filter,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  order: number;
  is_active: boolean;
  code: string;
  createdAt: string;
}

const fetchBanners = async (): Promise<Banner[]> => {
  const { data } = await axios.get('/api/admin/banners');
  return data;
};

export default function AdminBannersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['admin-banners'],
    queryFn: fetchBanners,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/admin/banners/${id}`);
    },
    onSuccess: () => {
      toast('Banner đã được xóa thành công.');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setDeleteBannerId(null);
    },
    onError: () => {
      toast('Lỗi khi xóa banner.', 'error');
      setDeleteBannerId(null);
    }
  });

  const filteredBanners = banners.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-black bg-white min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#E96E4A] mb-4" strokeWidth={1.5} />
        <p className="text-sm font-normal tracking-wide">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans antialiased">
      {/* Header: Banners & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[24px] font-normal text-black! tracking-tight">Banners</h1>
          <p className="text-[13px] text-gray-400 mt-1 font-normal">Manage your advertisement banners</p>
        </div>
        <Link href="/admin/banners/new">
          <Button className="bg-[#E96E4A]! hover:opacity-90 text-white! px-6 h-[42px] rounded-[10px] text-[13px] font-normal transition-all duration-300 shadow-sm">
            Add Banner
          </Button>
        </Link>
      </div>

      {/* Toolbar: Search & Actions */}
      <div className="flex items-center justify-between gap-6 mb-6">
        <div className="relative w-[320px]">
          <Input
            placeholder="Search banners..."
            className="bg-white border-[#E96E4A]! h-[42px] pl-4 rounded-[10px] text-[14px] text-black font-normal placeholder:text-gray-300 focus:border-[#E96E4A] transition-all outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-[42px] px-5 rounded-[10px] border-[#E96E4A]! text-black font-normal text-[12px] gap-2 hover:bg-orange-50 transition-all">
            <Filter className="w-4 h-4 text-[#E96E4A]" strokeWidth={1.5} /> Filter
          </Button>
          <Button variant="outline" className="h-[42px] px-5 rounded-[10px] border-[#E96E4A]! text-black font-normal text-[12px] gap-2 hover:bg-orange-50 transition-all">
            <FileSpreadsheet className="w-4 h-4 text-[#E96E4A]" strokeWidth={1.5} /> Excel
          </Button>
          <Button variant="outline" className="h-[42px] px-5 rounded-[10px] border-[#E96E4A]! text-black font-normal text-[12px] gap-2 hover:bg-orange-50 transition-all">
            <FileText className="w-4 h-4 text-[#E96E4A]" strokeWidth={1.5} /> PDF
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-[#E96E4A] rounded-[10px] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E96E4A] text-white border-b border-[#E96E4A]">
                <th className="px-6 py-4 text-[14px] font-normal capitalize tracking-wider">Image</th>
                <th className="px-6 py-4 text-[14px] font-normal capitalize tracking-wider">Code</th>
                <th className="px-6 py-4 text-[14px] font-normal capitalize tracking-wider">Link</th>
                <th className="px-6 py-4 text-[14px] font-normal capitalize tracking-wider">Order</th>
                <th className="px-6 py-4 text-[14px] font-normal capitalize tracking-wider">Status</th>
                <th className="px-6 py-4 text-[14px] font-normal capitalize tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E96E4A]">
              {paginatedBanners.length > 0 ? (
                paginatedBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-orange-50/50 transition-all duration-200 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-[50px] h-[50px] rounded-[10px] overflow-hidden bg-gray-50 border border-[#E96E4A]/30 shrink-0">
                          <Image src={banner.image} alt={banner.title} fill className="object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <span className="text-[14px] font-normal text-black truncate max-w-[200px]">{banner.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[12px] font-normal text-black uppercase tracking-tight">{banner.code || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] text-black font-normal truncate max-w-[180px] inline-block">{banner.link || '-'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] font-normal text-black">{banner.order}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[13px] font-normal ${banner.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {banner.is_active ? 'Active' : 'Hide'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/banners/edit/${banner.id}`}>
                          <button className="p-2 hover:bg-orange-50 rounded-lg text-black hover:text-[#E96E4A] transition-all" title="Edit Banner">
                            <Pencil className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteBannerId(banner.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-black hover:text-rose-500 transition-all"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-normal">
                    No banners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Pagination */}
        <div className="p-6 border-t border-[#E96E4A] flex justify-between items-center bg-white">
          <p className="text-[13px] font-normal text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBanners.length)} of {filteredBanners.length} banners
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
                  className={`w-[34px] h-[34px] rounded-[10px] text-[12px] font-normal transition-all ${
                    currentPage === page 
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

      {/* Delete Confirmation Modal */}
      {deleteBannerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white rounded-[10px] p-8 text-center shadow-2xl border border-gray-100">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-7 h-7 text-rose-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-normal text-black mb-2">Delete Banner?</h2>
            <p className="text-black mb-8 text-sm font-normal">Are you sure you want to delete this banner? This action is permanent.</p>
            <div className="flex gap-4">
              <button
                className="flex-1 py-3 rounded-[10px] border border-gray-100 text-black font-normal hover:bg-gray-50 transition-all"
                onClick={() => setDeleteBannerId(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-[10px] bg-rose-500 text-white font-normal hover:bg-rose-600 transition-all"
                onClick={() => deleteMutation.mutate(deleteBannerId)}
                disabled={deleteMutation.isPending}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
