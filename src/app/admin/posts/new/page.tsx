'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button, Input, Label } from '@/components/ui';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { ArrowLeft, Save, Send, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';

export default function NewPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
    description: ''
  });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await axios.get('/api/admin/categories');
        if (isMounted) setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories');
        console.error(err);
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
      await axios.post('/api/admin/post', { ...post, status });
      await queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast(status === 'PUBLISHED' ? 'Bài viết đã được xuất bản thành công!' : 'Đã lưu bản nháp thành công!');
      router.push('/admin/posts');
    } catch (err) {
      toast('Đã xảy ra lỗi khi lưu bài viết. Vui lòng thử lại.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/posts" className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <div className="flex gap-3">
          <Button
            onClick={(e) => handleSubmit(e, 'DRAFT')}
            disabled={loading}
            className="bg-white hover:bg-gray-50 border border-black/10 text-black font-bold h-11 px-6 rounded-[10px]"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu bản nháp
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, 'PUBLISHED')}
            disabled={loading}
            className="bg-black hover:bg-gray-900 text-white font-black h-11 px-8 rounded-[10px] shadow-lg shadow-black/20"
          >
            <Send className="h-4 w-4 mr-2" />
            Xuất bản ngay
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-black/10 bg-white shadow-xl rounded-[10px]">
            <CardHeader className="border-b border-black/5 pb-6">
              <CardTitle className="text-xl font-black text-black">Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-black text-black">Tiêu đề bài viết</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="text-lg font-bold py-7 bg-white border-black/10 rounded-[10px] focus:ring-black/5 text-black placeholder:text-gray-300"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-black text-black">Mô tả ngắn</Label>
                <textarea
                  id="description"
                  placeholder="Viết một đoạn tóm tắt nội dung bài viết sẽ hiển thị ngoài trang chủ..."
                  value={post.description}
                  onChange={(e) => setPost({ ...post, description: e.target.value })}
                  className="w-full flex min-h-[100px] rounded-[10px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/5 transition-all font-medium"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-black text-black">Nội dung chi tiết</Label>
                <TipTapEditor
                  value={post.content}
                  onChange={(content) => setPost({ ...post, content })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-black/10 bg-white shadow-xl rounded-[10px]">
            <CardHeader className="border-b border-black/5 pb-6">
              <CardTitle className="text-xl font-black text-black">Thiết lập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-black text-black">Danh mục</Label>
                <select
                  id="category"
                  value={post.categoryId}
                  onChange={(e) => setPost({ ...post, categoryId: e.target.value })}
                  className="w-full h-12 rounded-[10px] border border-black/10 bg-white px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none cursor-pointer font-bold"
                >
                  <option value="">Chọn danh mục...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="customAuthor" className="text-sm font-black text-black">Tên người viết (Tùy chỉnh)</Label>
                <Input
                  id="customAuthor"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={post.customAuthor}
                  onChange={(e) => setPost({ ...post, customAuthor: e.target.value })}
                  className="bg-white border-black/10 h-12 rounded-[10px] text-black"
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bỏ trống để sử dụng tên mặc định của bạn.</p>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-black text-black">Ảnh thu nhỏ (Thumbnail)</Label>
                <div className="group relative border-2 border-dashed border-gray-200 hover:border-black rounded-[10px] p-6 transition-all bg-gray-50/50">
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
                  {post.thumbnail ? (
                    <div className="relative">
                      <div className="rounded-[8px] overflow-hidden border border-black/5 aspect-video relative shadow-md">
                        <Image src={post.thumbnail} alt="Preview" fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white font-bold flex items-center gap-2 bg-black px-4 py-2 rounded-full text-xs">
                            <UploadCloud className="w-4 h-4" /> Đổi ảnh khác
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPost({ ...post, thumbnail: '' }); }}
                        className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-black font-black text-sm">Kéo thả hoặc click để chọn ảnh</p>
                        <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 tracking-widest">PNG, JPG, WEBP (Tối đa 2MB)</p>
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
