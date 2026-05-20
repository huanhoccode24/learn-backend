'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui';
import { Button, Input, Label } from '@/components/ui';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { Save, Send, UploadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';

export default function NewPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [post, setPost] = useState({
    title: '',
    content: '',
    thumbnail: '',
    categoryId: '',
    status: 'DRAFT',
    customAuthor: '',
    description: '',
    featured_request: false
  });

  const isTierUser = session?.user?.role === 'PRO' || session?.user?.role === 'VIP' || session?.user?.role === 'ADMIN';

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await axios.get('/api/categories');
        if (isMounted) setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    if (!post.title || !post.content) {
      toast('Vui lòng điền đầy đủ tiêu đề và nội dung', 'warning');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/collaborator/posts', { ...post, status });
      await queryClient.invalidateQueries({ queryKey: ['collaborator-posts'] });
      toast((status === 'PUBLISHED' || status === 'PENDING') ? 'Bài viết đã được gửi duyệt thành công!' : 'Đã lưu bản nháp thành công!');
      router.push('/collaborator/posts');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        toast(err.response.data.error, 'error');
      } else {
        toast('Đã xảy ra lỗi khi lưu bài viết. Vui lòng thử lại.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 space-y-6 pb-20 animate-in fade-in duration-500 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-6">
        <div>
          <h1 className="text-[26px] font-normal text-black! tracking-tight">Tạo bài viết mới</h1>
          <p className="text-[13px] text-gray-400 mt-1 font-normal">Xây dựng nội dung chất lượng cao và quản lý xuất bản</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/collaborator/posts">
            <Button variant="outline" className="h-[42px] border-gray-100 text-black! text-[13px] font-normal px-6 rounded-[10px] hover:bg-gray-50">
              Hủy bỏ
            </Button>
          </Link>
          <Button
            onClick={(e) => handleSubmit(e, 'DRAFT')}
            disabled={loading}
            className="bg-[#414141]! hover:bg-[#313131]! text-white! px-6 h-[42px] rounded-[10px] text-[13px] font-normal transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Lưu bản nháp
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, 'PENDING')}
            disabled={loading}
            className="bg-primary! hover:opacity-90 text-white! px-8 h-[42px] rounded-[10px] text-[13px] font-normal transition-all shadow-sm flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Gửi duyệt bài
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-200 bg-white rounded-[10px] p-8 shadow-none! space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-[13px] font-normal text-black!">Tiêu đề bài viết</Label>
                <span className={`text-[11px] ${post.title.length > 190 ? 'text-rose-500' : 'text-gray-400'}`}>
                  {post.title.length}/200
                </span>
              </div>
              <Input
                placeholder="Nhập tiêu đề hấp dẫn cho bài viết của bạn..."
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                maxLength={200}
                className="bg-white border-gray-100 h-14 rounded-[10px] text-[16px] font-medium text-black focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-normal text-black! mb-2 block">Mô tả ngắn</Label>
              <textarea
                placeholder="Viết một đoạn tóm tắt nội dung bài viết sẽ hiển thị ngoài danh sách..."
                value={post.description}
                onChange={(e) => setPost({ ...post, description: e.target.value })}
                className="w-full min-h-[120px] bg-white border border-gray-100 rounded-[10px] p-4 text-[14px] text-black focus:border-primary outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-normal text-black! mb-2 block">Nội dung chi tiết</Label>
              <div className="border border-gray-100 rounded-[10px] overflow-hidden min-h-[500px]">
                <TipTapEditor
                  value={post.content}
                  onChange={(content) => setPost({ ...post, content })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          <Card className="border border-gray-200 bg-white rounded-[10px] p-8 shadow-none! space-y-8">
            <div className="space-y-6">
              <h2 className="text-[14px] font-normal text-black! border-b border-gray-100 pb-3">Thiết lập bài viết</h2>
              
              <div className="space-y-2">
                <Label className="text-[13px] font-normal text-black! mb-2 block">Danh mục</Label>
                <select
                  value={post.categoryId}
                  onChange={(e) => setPost({ ...post, categoryId: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-gray-100 rounded-[10px] text-[14px] text-black focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Chọn danh mục...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-normal text-black! mb-2 block">Tác giả tùy chỉnh</Label>
                <Input
                  placeholder="Để trống nếu là bạn"
                  value={post.customAuthor}
                  onChange={(e) => setPost({ ...post, customAuthor: e.target.value })}
                  maxLength={255}
                  className="bg-white border-gray-100 h-12 rounded-[10px] text-[14px] text-black focus:border-primary transition-all"
                />
                <p className="text-[11px] text-gray-400 font-normal italic">* Mặc định sẽ lấy tên hiển thị của bạn</p>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <h2 className="text-[14px] font-normal text-black! border-b border-gray-100 pb-3">Ảnh đại diện</h2>
              
              <div className={`relative rounded-[10px] transition-all overflow-hidden ${post.thumbnail ? 'bg-white border border-gray-100' : 'border-2 border-dashed border-gray-100 bg-gray-50/30 p-8'}`}>
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="flex flex-col items-center justify-center">
                  {post.thumbnail ? (
                    <div className="w-full relative aspect-video bg-white">
                      <Image src={post.thumbnail} alt="Preview" fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
                        <p className="text-white text-[12px] font-normal flex items-center gap-2 bg-black/60 px-5 py-2 rounded-full border border-white/20">
                          <UploadCloud className="w-4 h-4" /> Đổi ảnh đại diện
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <UploadCloud className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                      <p className="text-[13px] text-gray-400 font-normal">Tải ảnh lên</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
