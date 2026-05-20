'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@/components/ui';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { ArrowLeft, Save, Send, Loader2, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';
import { useLock } from '@/hooks/useLock';
import { Lock } from 'lucide-react';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { isLockedByMe, lockInfo, isLoading: isLockLoading } = useLock('posts', resolvedParams.id);

  const [post, setPost] = useState({
    title: '',
    content: '',
    thumbnail: '',
    categoryId: '',
    status: 'DRAFT',
    customAuthor: '',
    description: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, postRes] = await Promise.all([
          axios.get('/api/admin/categories'),
          axios.get(`/api/admin/posts/${resolvedParams.id}`)
        ]);

        setCategories(catRes.data);

        const data = postRes.data;
        setPost({
          title: data.title || '',
          content: data.content || '',
          thumbnail: data.thumbnail || '',
          categoryId: data.categoryId || '',
          status: data.status || 'DRAFT',
          customAuthor: data.customAuthor || '',
          description: data.description || ''
        });
      } catch (err) {
        toast('Không thể tải dữ liệu bài viết. Vui lòng thử lại.', 'error');
        console.error(err);
        router.push('/admin/posts');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [resolvedParams.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent, submitStatus: string) => {
    e.preventDefault();
    if (!isLockedByMe) {
      toast('Bạn không có quyền chỉnh sửa bài viết này (đang bị khóa).', 'error');
      return;
    }

    if (!post.title || !post.content) {
      toast('Vui lòng điền đầy đủ tiêu đề và nội dung.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/admin/posts/${resolvedParams.id}`, { ...post, status: submitStatus });
      await queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast(submitStatus === 'PUBLISHED' ? 'Bài viết đã được cập nhật và xuất bản thành công!' : 'Đã lưu bản nháp cập nhật thành công!');
      router.push('/admin/posts');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 423) {
        toast('Không thể lưu: Nội dung đã bị người khác khóa.', 'error');
      } else {
        toast('Đã xảy ra lỗi khi lưu bài viết. Vui lòng thử lại.', 'error');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching || isLockLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/admin/posts" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách</span>
        </Link>
        <div className="flex gap-3">
          {!isLockedByMe && lockInfo && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-xs font-bold">
              <Lock className="w-4 h-4" />
              <span>Đang được sửa bởi {lockInfo.editingByName || 'người khác'}</span>
            </div>
          )}
          <Button
            onClick={(e) => handleSubmit(e, 'DRAFT')}
            disabled={loading || !isLockedByMe}
            variant="outline"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Lưu bản nháp
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, 'PUBLISHED')}
            disabled={loading || !isLockedByMe}
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Cập nhật & Đăng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề bài viết</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  disabled={!isLockedByMe}
                  className="text-lg font-semibold py-6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả ngắn</Label>
                <textarea
                  id="description"
                  placeholder="Viết một đoạn tóm tắt nội dung bài viết sẽ hiển thị ngoài trang chủ..."
                  value={post.description}
                  onChange={(e) => setPost({ ...post, description: e.target.value })}
                  disabled={!isLockedByMe}
                  className="w-full flex min-h-[80px] rounded-[10px] border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label>Nội dung chi tiết</Label>
                <TipTapEditor
                  value={post.content}
                  onChange={(content) => setPost({ ...post, content })}
                  roomId={`post-${resolvedParams.id}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Thiết lập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <select
                  id="category"
                  value={post.categoryId}
                  onChange={(e) => setPost({ ...post, categoryId: e.target.value })}
                  disabled={!isLockedByMe}
                  className="w-full h-11 rounded-[10px] border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer disabled:cursor-not-allowed"
                >
                  <option value="">Chưa phân loại</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customAuthor">Tên người viết (Tùy chỉnh)</Label>
                <Input
                  id="customAuthor"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={post.customAuthor}
                  onChange={(e) => setPost({ ...post, customAuthor: e.target.value })}
                  disabled={!isLockedByMe}
                />
                <p className="text-[10px] text-slate-500 font-medium">Bỏ trống để sử dụng tên mặc định của bạn.</p>
              </div>
              <div className="space-y-2">
                <Label>Ảnh thu nhỏ (Thumbnail)</Label>
                <div className={`group relative border-2 border-dashed border-slate-700 rounded-xl p-4 transition-all bg-slate-950/50 ${isLockedByMe ? 'hover:border-indigo-500/50' : 'cursor-not-allowed'}`}>
                  {isLockedByMe && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast('Kích thước ảnh phải nhỏ hơn 2MB.', 'warning');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPost({ ...post, thumbnail: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  )}
                  {post.thumbnail ? (
                    <div className="relative">
                      <div className={`rounded-lg overflow-hidden border border-slate-700 aspect-video relative ${!isLockedByMe ? 'opacity-50 grayscale' : ''}`}>
                        <Image src={post.thumbnail} alt="Preview" fill className="object-cover" unoptimized />
                        {!isLockedByMe && lockInfo && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
                            <Lock className="w-8 h-8 text-amber-500 mb-2" />
                            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest text-center px-4">
                              Đang bị khóa bởi {lockInfo.editingByName || 'Admin khác'}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isLockedByMe && (
                            <p className="text-white font-semibold flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 text-sm">
                              <UploadCloud className="w-4 h-4" /> Đổi ảnh khác
                            </p>
                          )}
                        </div>
                      </div>
                      {isLockedByMe && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPost({ ...post, thumbnail: '' }); }}
                          className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                      <div className={`w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center ${isLockedByMe ? 'group-hover:scale-110' : ''} transition-transform`}>
                        {isLockedByMe ? (
                          <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        ) : (
                          <Lock className="w-6 h-6 text-amber-500" />
                        )}
                      </div>
                      <div className="text-center px-4">
                        {isLockedByMe ? (
                          <>
                            <p className="text-slate-300 font-bold text-sm">Kéo thả hoặc click để chọn ảnh</p>
                            <p className="text-slate-500 text-xs mt-1">PNG, JPG, WEBP (Tối đa 2MB)</p>
                          </>
                        ) : (
                          <>
                            <p className="text-amber-500 font-bold text-sm uppercase tracking-wider">Vùng ảnh đang bị khóa</p>
                            <p className="text-slate-500 text-[10px] mt-1">
                              Bởi {lockInfo?.editingByName || 'Admin khác'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
