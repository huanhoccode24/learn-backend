'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import {
  Button,
  Input,
} from '@/components/ui';
import {
  Search,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  status: 'PUBLISHED' | 'DRAFT' | 'PENDING' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  categoryName: string | null;
  authorName: string | null;
  customAuthor: string | null;
  description: string | null;
  is_featured: boolean;
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get('/api/admin/posts');
  return data;
};


export default function AdminPostsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const itemsPerPage = 8;

  const { data: posts = [], isLoading: isLoadingPosts, error: postsError } = useQuery<Post[]>({
    queryKey: ['admin-posts'],
    queryFn: fetchPosts,
  });


  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string, status: string, reason?: string }) => {
      const { data } = await axios.patch(`/api/admin/posts/${id}`, { status, rejectionReason: reason });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      
      if (variables.status === 'PUBLISHED') {
        toast('Đã duyệt bài viết thành công');
      } else if (variables.status === 'REJECTED') {
        // Kiểm tra xem bài gốc là PUBLISHED hay PENDING
        const post = posts.find(p => p.id === variables.id);
        if (post?.status === 'PUBLISHED') {
          toast('Đã gỡ bỏ bài viết thành công');
        } else {
          toast('Đã từ chối bài viết thành công');
        }
      } else {
        toast('Cập nhật trạng thái bài viết thành công');
      }

      setIsRejectModalOpen(false);
      setRejectionReason('');
      setRejectingPostId(null);
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast(error.response?.data?.error || 'Đã có lỗi xảy ra', 'error');
    }
  });

  const handleApprove = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn duyệt bài viết này?')) {
      updateStatusMutation.mutate({ id, status: 'PUBLISHED' });
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setRejectingPostId(id);
    setIsRejectModalOpen(true);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast('Vui lòng nhập lý do từ chối', 'error');
      return;
    }
    if (rejectingPostId) {
      updateStatusMutation.mutate({ id: rejectingPostId, status: 'REJECTED', reason: rejectionReason });
    }
  };

  const handleRemove = (id: string) => {
    setRejectingPostId(id);
    setIsRejectModalOpen(true);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Published' && post.status === 'PUBLISHED') ||
      (activeTab === 'Draft' && post.status === 'DRAFT') ||
      (activeTab === 'Pending' && post.status === 'PENDING') ||
      (activeTab === 'Rejected' && post.status === 'REJECTED');
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoadingPosts) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-black bg-white min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary! mb-4" strokeWidth={1.5} />
        <p className="text-sm font-normal tracking-wide">Đang tải danh sách bài viết...</p>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-red-400 bg-white min-h-screen">
        <AlertCircle className="w-10 h-10 mb-4" />
        <p className="text-sm font-normal">Không thể tải dữ liệu bài viết.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans antialiased px-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pt-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-black! tracking-tight">Bài viết</h1>
          <p className="text-[14px] text-gray-400 font-normal">Quản lý nội dung bài viết và quy trình phê duyệt</p>
        </div>
      </div>

      {/* Stats Overview - Premium Style with 4 per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <PremiumStatCard
          title="Tổng bài viết"
          value={posts.length.toLocaleString()}
          icon={FileText}
          iconBg="#FF2D55"
          cardBg="#FFF0F3"
        />
        <PremiumStatCard
          title="Đã xuất bản"
          value={posts.filter(p => p.status === 'PUBLISHED').length.toLocaleString()}
          icon={CheckCircle2}
          iconBg="#00C781"
          cardBg="#F0FFF8"
        />
        <PremiumStatCard
          title="Bản nháp"
          value={posts.filter(p => p.status === 'DRAFT').length.toLocaleString()}
          icon={Clock}
          iconBg="#FF9500"
          cardBg="#FFF9F0"
        />
        <PremiumStatCard
          title="Chờ phê duyệt"
          value={posts.filter(p => p.status === 'PENDING').length.toLocaleString()}
          icon={Clock}
          iconBg="#00A2FF"
          cardBg="#F0F9FF"
        />
        <PremiumStatCard
          title="Từ chối"
          value={posts.filter(p => p.status === 'REJECTED').length.toLocaleString()}
          icon={X}
          iconBg="#AF52DE"
          cardBg="#F5F0FF"
        />
      </div>

      {/* Content Bar: Tabs & Search */}
      <div className="mb-4 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex p-1.5 bg-gray-50/80 border border-gray-100 rounded-[14px] w-full lg:w-auto overflow-x-auto no-scrollbar">
          {['All', 'Published', 'Draft', 'Pending', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-5 py-2 text-[13px] font-bold transition-all whitespace-nowrap rounded-[10px] cursor-pointer ${
                activeTab === tab 
                  ? 'bg-white text-primary shadow-sm shadow-orange-100/50 border border-orange-50' 
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              {tab === 'All' ? 'Tất cả' :
                tab === 'Published' ? 'Đã đăng' :
                  tab === 'Draft' ? 'Bản nháp' :
                    tab === 'Pending' ? 'Chờ duyệt' : 'Từ chối'}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            className="bg-white border-primary! h-[44px] pl-11 pr-4 rounded-[14px] text-[14px] text-black font-normal placeholder:text-gray-300 focus:border-primary transition-all outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-primary rounded-[10px] overflow-hidden bg-white shadow-none">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-primary text-white">
                <th className="sticky left-0 z-30 bg-primary px-8 py-5 text-[15px] font-normal tracking-wide border-r border-white/20 whitespace-nowrap w-[320px] min-w-[320px]">Bài viết</th>
                <th className="px-6 py-5 text-[15px] font-normal tracking-wide whitespace-nowrap w-[200px] min-w-[200px]">Tác giả</th>
                <th className="px-6 py-5 text-[15px] font-normal tracking-wide whitespace-nowrap w-[200px] min-w-[200px]">Danh mục</th>
                <th className="px-6 py-5 text-[15px] font-normal tracking-wide whitespace-nowrap w-[200px] min-w-[200px]">Mô tả</th>
                <th className="px-6 py-5 text-[15px] font-normal tracking-wide text-center whitespace-nowrap w-[200px] min-w-[200px]">Trạng thái</th>
                <th className="px-6 py-5 text-[15px] font-normal tracking-wide text-center whitespace-nowrap w-[200px] min-w-[200px]">Ngày đăng</th>
                <th className="px-8 py-5 text-[15px] font-normal tracking-wide text-right whitespace-nowrap w-[200px] min-w-[200px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary">
              {paginatedPosts.map((post) => (
                <tr key={post.id} className="hover:bg-[#FFF7ED] transition-all duration-200 group">
                  <td className="sticky left-0 z-20 bg-white group-hover:bg-[#FFF7ED] px-8 py-5 border-r border-orange-100/50 w-[320px] min-w-[320px] transition-colors shadow-[6px_0_12px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-4">
                      <div className="relative w-[54px] h-[54px] rounded-[12px] overflow-hidden shrink-0 border border-primary shadow-none bg-gray-50">
                        {post.thumbnail ? (
                          <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <FileText className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 max-w-[300px]">
                        <span className="text-[14px] font-normal text-black line-clamp-1">{post.title}</span>
                        {post.is_featured && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                            <Star className="w-3 h-3 fill-emerald-600" />
                            <span>Đang nổi bật</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col leading-tight max-h-[50px] overflow-hidden group/author relative">
                      {(() => {
                        const allAuthors = [
                          post.authorName || 'N/A',
                          ...(post.customAuthor ? post.customAuthor.split(/[,;]/).map(s => s.trim()).filter(Boolean) : [])
                        ];
                        // Nhóm 2 người 1 hàng
                        const chunks = [];
                        for (let i = 0; i < allAuthors.length; i += 2) {
                          chunks.push(allAuthors.slice(i, i + 2));
                        }
                        return chunks.map((chunk, idx) => (
                          <span key={idx} className="text-[13px] text-black font-normal truncate">
                            {chunk.join(', ')}{idx < chunks.length - 1 ? ',' : ''}
                          </span>
                        ));
                      })()}
                      {/* Tooltip đầy đủ */}
                      {post.customAuthor && (
                        <div className="absolute hidden group-hover/author:block z-50 bg-black text-white text-[11px] p-2 rounded-md -top-2 left-full ml-2 w-max max-w-[250px] shadow-xl">
                          {[post.authorName, post.customAuthor].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[14px] text-black font-normal">{post.categoryName || 'Chưa phân loại'}</span>
                  </td>
                  <td className="px-6 py-5 text-gray-400">
                    <div 
                      className="text-[14px] font-normal line-clamp-2 break-all overflow-hidden" 
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                      title={post.description || ''}
                    >
                      {post.description || 'Không có mô tả'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-normal capitalize tracking-wider ${post.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        post.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          post.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${post.status === 'PUBLISHED' ? 'bg-emerald-500' :
                          post.status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                            post.status === 'REJECTED' ? 'bg-rose-500' :
                              'bg-gray-400'
                          }`} />
                        {post.status === 'PUBLISHED' ? 'Đã đăng' :
                          post.status === 'PENDING' ? 'Chờ duyệt' :
                            post.status === 'REJECTED' ? 'Bị từ chối' : 'Bản nháp'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-[14px] text-black font-normal">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-5 transition-all">
                      {post.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleApprove(post.id)} 
                            className="text-[14px] text-gray-400 group-hover:text-black hover:text-emerald-600! font-normal transition-colors cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button 
                            onClick={() => handleOpenRejectModal(post.id)} 
                            className="text-[14px] text-gray-400 group-hover:text-black hover:text-rose-600! font-normal transition-colors cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      <Link href={`/admin/posts/${post.id}`}>
                        <button className="text-[14px] text-gray-400 group-hover:text-black hover:text-black font-normal transition-colors cursor-pointer">
                          Xem
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleRemove(post.id)} 
                        className="text-[14px] text-gray-400 group-hover:text-black hover:text-rose-600! font-normal transition-colors cursor-pointer"
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-6 border-t border-primary flex justify-between items-center bg-white">
          <p className="text-[13px] font-normal text-gray-400">
            Hiển thị <span className="text-black font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-black font-bold">{Math.min(currentPage * itemsPerPage, filteredPosts.length)}</span> trên <span className="text-black font-bold">{filteredPosts.length}</span> bài viết
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-[10px] bg-gray-50 text-black text-[12px] font-normal hover:bg-orange-50 transition-all disabled:opacity-50 border border-primary/30"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[34px] h-[34px] rounded-[10px] text-[12px] font-normal transition-all ${currentPage === page
                    ? 'bg-primary text-white'
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
              className="px-4 py-2 rounded-[10px] bg-gray-50 text-black text-[12px] font-normal hover:bg-orange-50 transition-all disabled:opacity-50 border border-primary/30"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Reject/Remove Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8">
            <h3 className="text-[20px] font-bold text-black mb-2">
              {posts.find(p => p.id === rejectingPostId)?.status === 'PUBLISHED' ? 'Gỡ bỏ bài viết' : 'Từ chối bài viết'}
            </h3>
            <p className="text-[13px] text-gray-400 mb-6 font-normal">
              {posts.find(p => p.id === rejectingPostId)?.status === 'PUBLISHED' 
                ? 'Bài viết sẽ bị gỡ khỏi trang chủ. Vui lòng nhập lý do gỡ bỏ.' 
                : 'Vui lòng cung cấp lý do từ chối để tác giả biết cần chỉnh sửa gì.'}
            </p>
            <textarea
              className="w-full bg-gray-50 border border-gray-100 rounded-[12px] p-4 text-[14px] text-black min-h-[120px] focus:outline-none focus:border-primary transition-all mb-6 placeholder:text-gray-300"
              placeholder="Nhập lý do tại đây..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsRejectModalOpen(false); setRejectionReason(''); setRejectingPostId(null); }} className="rounded-[10px] h-[44px] px-6">Hủy</Button>
              <Button onClick={handleReject} disabled={updateStatusMutation.isPending} className="bg-red-500! text-white! rounded-[10px] h-[44px] px-6 font-bold">
                Xác nhận {posts.find(p => p.id === rejectingPostId)?.status === 'PUBLISHED' ? 'gỡ bỏ' : 'từ chối'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PremiumStatCard = ({ title, value, icon: Icon, iconBg, cardBg }: { title: string, value: string, icon: React.ElementType, iconBg: string, cardBg: string }) => (
  <div style={{ backgroundColor: cardBg }} className="p-7 rounded-[10px] flex items-center gap-6 shadow-none transition-all hover:scale-[1.02] cursor-default group">
    <div style={{ backgroundColor: iconBg }} className="w-16 h-16 rounded-[12px] flex items-center justify-center shrink-0 shadow-none transition-transform group-hover:scale-110">
      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
    </div>
    <div className="space-y-1">
      <p className="text-[13px] font-bold text-slate-500/80">{title}</p>
      <h4 className="text-[28px] font-black text-black! leading-none">{value}</h4>
    </div>
  </div>
);
