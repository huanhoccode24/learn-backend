'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Button,
  Input,
} from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Loader2,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  Star
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  status: 'PUBLISHED' | 'DRAFT' | 'PENDING' | 'REJECTED';
  createdAt: string;
  categoryName: string | null;
  authorName: string | null;
  customAuthor: string | null;
  description: string | null;
  is_featured: boolean;
  rejectionReason?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get('/api/collaborator/posts');
  return data;
};

const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await axios.get('/api/categories');
  return data;
};

export default function CollaboratorPostsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: posts = [], isLoading: isLoadingPosts, error: postsError } = useQuery<Post[]>({
    queryKey: ['collaborator-posts'],
    queryFn: fetchPosts,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Logic lọc và phân trang
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) return;
    
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/posts/${id}`);
      toast('Đã xóa bài viết thành công');
      queryClient.invalidateQueries({ queryKey: ['collaborator-posts'] });
    } catch (err) {
      console.error('Failed to delete post', err);
      toast('Không thể xóa bài viết. Vui lòng thử lại.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/admin/posts/${id}`, { is_featured: !currentStatus });
      toast('Đã cập nhật trạng thái nổi bật');
      queryClient.invalidateQueries({ queryKey: ['collaborator-posts'] });
    } catch (err) {
      console.error('Failed to toggle featured status', err);
      toast('Không thể cập nhật trạng thái. Vui lòng thử lại.', 'error');
    }
  };

  const getStatusBadge = (post: Post) => {
    switch (post.status) {
      case 'PUBLISHED':
        return (
          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-normal capitalize tracking-wider border border-emerald-100 whitespace-nowrap w-fit mx-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã đăng
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-[11px] font-normal capitalize tracking-wider border border-blue-100 whitespace-nowrap w-fit mx-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Chờ duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-[11px] font-normal capitalize tracking-wider border border-rose-100 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Bị từ chối
            </span>
            {post.rejectionReason && (
              <span className="text-[10px] text-rose-400 italic max-w-[120px] truncate" title={post.rejectionReason}>
                - {post.rejectionReason}
              </span>
            )}
          </div>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-[11px] font-normal capitalize tracking-wider border border-amber-100 whitespace-nowrap w-fit mx-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Bản nháp
          </span>
        );
    }
  };

  if (isLoadingPosts) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-12 h-12 animate-spin text-rose-500 mb-4" />
        <p className="font-bold text-lg">Đang tải danh sách bài viết...</p>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="font-bold text-lg">Không thể tải dữ liệu bài viết.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-black! tracking-tight flex items-center gap-3">
            Bài viết của tôi
          </h1>
          <p className="text-gray-500 font-medium">Quản lý, chỉnh sửa và theo dõi hiệu suất các bài viết của bạn.</p>
        </div>

        <Link href="/collaborator/posts/new">
          <Button variant="primary" className="h-12 px-6 flex gap-2 group transition-all shadow-none">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-bold uppercase text-[10px] tracking-widest">Viết bài mới</span>
          </Button>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-50/50 p-6 rounded-[8px] border border-rose-200 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-[8px] bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-rose-900/60">Tổng số bài viết</p>
            <p className="text-2xl font-black text-black!">{filteredPosts.length}</p>
          </div>
        </div>
        
        <div className="bg-blue-50/50 p-6 rounded-[8px] border border-blue-200 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-[8px] bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Loader2 className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900/60">Đang chờ duyệt</p>
            <p className="text-2xl font-black text-black!">{posts.filter(p => p.status === 'PENDING').length}</p>
          </div>
        </div>

        <div className="bg-emerald-50/50 p-6 rounded-[8px] border border-emerald-200 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-[8px] bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-900/60">Đã xuất bản</p>
            <p className="text-2xl font-black text-black!">{posts.filter(p => p.status === 'PUBLISHED').length}</p>
          </div>
        </div>

        <div className="bg-amber-50/50 p-6 rounded-[8px] border border-amber-200 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-[8px] bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <FileText className="w-6 h-6 text-white opacity-80" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900/60">Bản nháp</p>
            <p className="text-2xl font-black text-black!">{posts.filter(p => p.status === 'DRAFT').length}</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:flex-1 group">
          <Input
            className="pl-12 bg-white border border-primary! h-12 rounded-[8px] focus:ring-primary/10 transition-all text-sm text-black placeholder:text-gray-400"
            placeholder="Tìm kiếm bài viết theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110 pointer-events-none z-10">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary" />
          </div>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative inline-block w-full lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-12 bg-white border border-primary! rounded-[8px] px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer transition-all"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-primary rounded-[8px] overflow-hidden bg-white shadow-xl">
        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto overflow-y-hidden custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-primary text-white border-b border-primary">
                <th className="sticky left-0 z-30 bg-primary px-8 py-5 text-[13px] font-medium capitalize tracking-wider border-r border-white/20 whitespace-nowrap w-[320px] min-w-[320px]">Bài viết</th>
                <th className="px-8 py-5 text-[13px] font-medium capitalize tracking-wider whitespace-nowrap w-[200px] min-w-[200px]">Tác giả</th>
                <th className="px-8 py-5 text-[13px] font-medium capitalize tracking-wider whitespace-nowrap w-[200px] min-w-[200px]">Danh mục</th>
                <th className="px-8 py-5 text-[13px] font-medium capitalize tracking-wider whitespace-nowrap w-[200px] min-w-[200px]">Mô tả</th>
                <th className="px-8 py-5 text-[13px] font-medium capitalize tracking-wider whitespace-nowrap w-[200px] min-w-[200px] text-center">Trạng thái</th>
                <th className="px-8 py-5 text-[13px] font-medium capitalize tracking-wider whitespace-nowrap w-[120px] min-w-[120px] text-center">Nổi bật</th>
                <th className="px-8 py-5 text-[13px] font-medium capitalize tracking-wider whitespace-nowrap w-[200px] min-w-[200px] text-center">Ngày tạo</th>
                <th className="px-8 py-5 text-[13px] font-medium capitalize tracking-wider text-right whitespace-nowrap w-[200px] min-w-[200px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/20">
              {paginatedPosts.length > 0 ? (
                paginatedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FFF7ED] transition-all group">
                    <td className="sticky left-0 z-20 bg-white group-hover:bg-[#FFF7ED] px-8 py-4 border-r border-orange-100/50 w-[320px] min-w-[320px] transition-colors shadow-[6px_0_12px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center gap-4">
                        <div className="relative w-[50px] h-[50px] rounded-[10px] overflow-hidden bg-gray-50 border border-primary/20 shrink-0 group-hover:border-primary/50 transition-all">
                          {post.thumbnail ? (
                            <Image src={post.thumbnail} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <FileText className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <span className="text-[14px] font-medium text-black truncate max-w-[280px] group-hover:text-primary transition-colors" title={post.title}>
                          {post.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col leading-tight max-h-[48px] overflow-hidden group/author relative">
                        {(() => {
                          const allAuthors = [
                            post.authorName || 'N/A',
                            ...(post.customAuthor ? post.customAuthor.split(/[,;]/).map(s => s.trim()).filter(Boolean) : [])
                          ];
                          const chunks = [];
                          for (let i = 0; i < allAuthors.length; i += 2) {
                            chunks.push(allAuthors.slice(i, i + 2));
                          }
                          return chunks.map((chunk, idx) => (
                            <span key={idx} className="text-[13px] font-normal text-black truncate">
                              {chunk.join(', ')}{idx < chunks.length - 1 ? ',' : ''}
                            </span>
                          ));
                        })()}
                        {/* Tooltip đầy đủ */}
                        {post.customAuthor && (
                          <div className="absolute hidden group-hover/author:block z-50 bg-black text-white text-[10px] p-2 rounded-md -top-2 left-full ml-2 w-max max-w-[250px] shadow-xl">
                            {[post.authorName, post.customAuthor].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-[13px] text-gray-500 font-medium">{post.categoryName || 'Chưa phân loại'}</span>
                    </td>
                    <td className="px-8 py-4 text-gray-400">
                      <div 
                        className="text-[12px] font-normal line-clamp-2 break-all overflow-hidden" 
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                        title={post.description || ''}
                      >
                        {post.description || 'Không có mô tả'}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      {getStatusBadge(post)}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                        className={`p-2 rounded-lg transition-all ${
                          post.is_featured 
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                            : 'text-gray-300 hover:text-amber-400 hover:bg-gray-50'
                        }`}
                        title={post.is_featured ? "Bỏ đánh dấu nổi bật" : "Đánh dấu nổi bật"}
                      >
                        <Star className={`w-5 h-5 ${post.is_featured ? 'fill-amber-500' : ''}`} />
                      </button>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className="text-[13px] text-gray-500 font-normal">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <button className="p-2 hover:bg-orange-50 rounded-lg text-black hover:text-primary transition-all" title="Xem bài viết">
                            <Eye className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </Link>
                        <Link href={`/collaborator/posts/edit/${post.id}`}>
                          <button className="p-2 hover:bg-orange-50 rounded-lg text-black hover:text-primary transition-all" title="Sửa bài viết">
                            <Pencil className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deletingId === post.id}
                          className="p-2 hover:bg-rose-50 rounded-lg text-black hover:text-rose-500 transition-all disabled:opacity-30" 
                          title="Xóa bài viết"
                        >
                          {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" strokeWidth={1.5} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-normal">
                    Không tìm thấy bài viết nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="block md:hidden p-4 space-y-4 bg-gray-50/50">
          {paginatedPosts.length > 0 ? (
            paginatedPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-[12px] border border-primary/20 p-4 space-y-4 hover:border-primary/50 transition-all shadow-sm">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-[80px] h-[80px] rounded-[10px] overflow-hidden bg-gray-50 border border-primary/10 shrink-0">
                    {post.thumbnail ? (
                      <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <FileText className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Title & Category & Date */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-primary bg-orange-50 px-2 py-0.5 rounded-full">
                          {post.categoryName || 'Chưa phân loại'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium truncate">
                          By: {post.authorName || 'N/A'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-black line-clamp-2 leading-tight" title={post.title}>
                        {post.title}
                      </h3>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {post.description && (
                  <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {post.description}
                  </p>
                )}

                {/* Footer: Status, Featured & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(post)}
                    <button
                      onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                      className={`p-1.5 rounded-lg transition-all ${
                        post.is_featured 
                          ? 'text-amber-500 bg-amber-50' 
                          : 'text-gray-300 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${post.is_featured ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1">
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <button className="p-2 hover:bg-orange-50 rounded-lg text-black hover:text-primary transition-all" title="Xem bài viết">
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </Link>
                    <Link href={`/collaborator/posts/edit/${post.id}`}>
                      <button className="p-2 hover:bg-orange-50 rounded-lg text-black hover:text-primary transition-all" title="Sửa bài viết">
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deletingId === post.id}
                      className="p-2 hover:bg-rose-50 rounded-lg text-black hover:text-rose-500 transition-all disabled:opacity-30" 
                      title="Xóa bài viết"
                    >
                      {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[12px] border border-primary/20 p-8 text-center text-gray-400">
              Không tìm thấy bài viết nào.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-6 border-t border-primary flex flex-col sm:flex-row justify-between items-center bg-white gap-4">
          <p className="text-[13px] font-normal text-gray-400 text-center sm:text-left">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, filteredPosts.length)} trong tổng số {filteredPosts.length} bài viết
          </p>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-[8px] bg-gray-50 text-black text-[12px] font-normal hover:bg-orange-50 transition-all disabled:opacity-50 border border-primary/30"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[34px] h-[34px] rounded-[8px] text-[12px] font-normal transition-all ${currentPage === page
                    ? 'bg-primary text-white shadow-lg shadow-orange-500/20'
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
              className="px-4 py-2 rounded-[8px] bg-gray-50 text-black text-[12px] font-normal hover:bg-orange-50 transition-all disabled:opacity-50 border border-primary/30"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
