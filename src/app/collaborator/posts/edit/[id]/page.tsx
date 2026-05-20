'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, Label } from '@/components/ui';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { Save, Send, Loader2, UploadCloud, Lock } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import Image from 'next/image';
import { useLock } from '@/hooks/useLock';
import { useSession } from 'next-auth/react';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
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
    description: '',
    authorId: ''
  });

  const [collabEmail, setCollabEmail] = useState('');
  const [collabs, setCollabs] = useState<{ id: string, name: string, email: string, isAuthor: boolean }[]>([]);
  const [inviting, setInviting] = useState(false);

  const isOwner = session?.user?.id === post.authorId;

  useEffect(() => {
    async function loadCollabs() {
      try {
        const res = await axios.get(`/api/collaborator/posts/${resolvedParams.id}/collaborators`);
        setCollabs(res.data);
      } catch (err) {
        console.error('Failed to fetch collaborators', err);
      }
    }
    loadCollabs();
  }, [resolvedParams.id]);

  const handleInviteCollab = async () => {
    if (!collabEmail || !isOwner) return;
    setInviting(true);
    try {
      await axios.post(`/api/collaborator/posts/${resolvedParams.id}/collaborators`, { email: collabEmail });
      toast('Đã mời cộng tác viên thành công!');
      setCollabEmail('');
      const res = await axios.get(`/api/collaborator/posts/${resolvedParams.id}/collaborators`);
      setCollabs(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        toast(err.response.data.error, 'error');
      } else {
        toast('Đã xảy ra lỗi khi mời cộng tác viên.', 'error');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollab = async (userId: string) => {
    if (!isOwner && session?.user?.id !== userId) return;
    try {
      await axios.delete(`/api/collaborator/posts/${resolvedParams.id}/collaborators`, { data: { userId } });
      toast('Đã xóa cộng tác viên!');
      setCollabs(collabs.filter(c => c.id !== userId));
    } catch (err) {
      console.error('Failed to remove collaborator', err);
      toast('Không thể xóa cộng tác viên.', 'error');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, postRes] = await Promise.all([
          axios.get('/api/categories'),
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
          description: data.description || '',
          authorId: data.authorId || ''
        });
      } catch (err) {
        console.error('Failed to load post data', err);
        toast('Không thể tải dữ liệu bài viết. Vui lòng thử lại.', 'error');
        router.push('/collaborator/posts');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [resolvedParams.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent, submitStatus: string) => {
    e.preventDefault();
    if (!isOwner) {
      toast('Chỉ người tạo bài viết mới có quyền lưu hoặc gửi duyệt.', 'error');
      return;
    }
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
      await queryClient.invalidateQueries({ queryKey: ['collaborator-posts'] });
      toast((submitStatus === 'PUBLISHED' || submitStatus === 'PENDING') ? 'Bài viết đã được gửi duyệt thành công!' : 'Đã lưu bản nháp cập nhật thành công!');
      router.push('/collaborator/posts');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 423) {
        toast('Không thể lưu: Nội dung đã bị người khác khóa.', 'error');
      } else {
        toast('Đã xảy ra lỗi khi lưu bài viết. Vui lòng thử lại.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching || isLockLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-[13px] font-normal text-gray-400">Đang tải dữ liệu bài viết...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6 pb-20 animate-in fade-in duration-500 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-normal text-black! tracking-tight">Chỉnh sửa bài viết</h1>
            {!isLockedByMe && lockInfo && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-600 text-[10px] font-black uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa bởi {lockInfo.editingByName || 'người khác'}</span>
              </div>
            )}
          </div>
          <p className="text-[13px] text-gray-400 mt-1 font-normal">Cập nhật nội dung và quản lý quyền cộng tác</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/collaborator/posts">
            <Button variant="outline" className="h-[42px] border-gray-100 text-black! text-[13px] font-normal px-6 rounded-[10px] hover:bg-gray-50">
              Hủy bỏ
            </Button>
          </Link>
          {isOwner && (
            <>
              <Button
                onClick={(e) => handleSubmit(e, 'DRAFT')}
                disabled={loading || !isLockedByMe}
                className="bg-[#414141]! hover:bg-[#313131]! text-white! px-6 h-[42px] rounded-[10px] text-[13px] font-normal transition-all shadow-sm flex items-center gap-2 disabled:opacity-30"
              >
                <Save className="w-4 h-4" />
                Lưu bản nháp
              </Button>
              <Button
                onClick={(e) => handleSubmit(e, 'PENDING')}
                disabled={loading || !isLockedByMe}
                className="bg-primary! hover:opacity-90 text-white! px-8 h-[42px] rounded-[10px] text-[13px] font-normal transition-all shadow-sm flex items-center gap-2 disabled:opacity-30"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Cập nhật & Gửi duyệt
              </Button>
            </>
          )}
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
                placeholder="Nhập tiêu đề hấp dẫn..."
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                disabled={!isLockedByMe}
                maxLength={200}
                className="bg-white border-gray-100 h-14 rounded-[10px] text-[16px] font-medium text-black focus:border-primary outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-normal text-black! mb-2 block">Mô tả ngắn</Label>
              <textarea
                placeholder="Viết một đoạn tóm tắt nội dung bài viết..."
                value={post.description}
                onChange={(e) => setPost({ ...post, description: e.target.value })}
                disabled={!isLockedByMe}
                className="w-full min-h-[120px] bg-white border border-gray-100 rounded-[10px] p-4 text-[14px] text-black focus:border-primary outline-none transition-all resize-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-normal text-black! mb-2 block">Nội dung chi tiết</Label>
              <div className={`border border-gray-100 rounded-[10px] overflow-hidden min-h-[500px] shadow-none ${!isLockedByMe ? 'opacity-80' : ''}`}>
                <TipTapEditor
                  value={post.content}
                  onChange={(content) => setPost({ ...post, content })}
                  roomId={`post-${resolvedParams.id}`}
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
                  disabled={!isLockedByMe}
                  className="w-full h-12 px-4 bg-white border border-gray-100 rounded-[10px] text-[14px] text-black focus:border-primary outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Chưa phân loại</option>
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
                  disabled={!isLockedByMe}
                  maxLength={255}
                  className="bg-white border-gray-100 h-12 rounded-[10px] text-[14px] text-black focus:border-primary transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <h2 className="text-[14px] font-normal text-black! border-b border-gray-100 pb-3">Ảnh đại diện</h2>
              
              <div className={`relative rounded-[10px] transition-all overflow-hidden ${post.thumbnail ? 'bg-white border border-gray-100' : 'border-2 border-dashed border-gray-100 bg-gray-50/30 p-8'}`}>
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
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                )}
                <div className="flex flex-col items-center justify-center">
                  {post.thumbnail ? (
                    <div className={`w-full relative aspect-video bg-white ${!isLockedByMe ? 'opacity-50 grayscale' : ''}`}>
                      <Image src={post.thumbnail} alt="Preview" fill className="object-cover" unoptimized />
                      {isLockedByMe ? (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
                          <p className="text-white text-[12px] font-normal flex items-center gap-2 bg-black/60 px-5 py-2 rounded-full border border-white/20">
                            <UploadCloud className="w-4 h-4" /> Đổi ảnh
                          </p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <Lock className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      {isLockedByMe ? <UploadCloud className="w-8 h-8 text-gray-300" strokeWidth={1.5} /> : <Lock className="w-8 h-8 text-amber-500" />}
                      <p className="text-[13px] text-gray-400 font-normal">
                        {isLockedByMe ? 'Tải ảnh lên' : 'Đang bị khóa'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-6 pt-2 border-t border-gray-50 mt-4">
              <h2 className="text-[14px] font-normal text-black! border-b border-gray-100 pb-3">Cộng tác viên</h2>
              <div className="space-y-4">
                {isOwner && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email..."
                      value={collabEmail}
                      onChange={(e) => setCollabEmail(e.target.value)}
                      className="h-10 border-gray-100 rounded-[10px] text-xs"
                    />
                    <Button onClick={handleInviteCollab} disabled={inviting} className="bg-primary! text-white! h-10 px-4 rounded-[10px] text-[10px] font-normal">
                      {inviting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mời'}
                    </Button>
                  </div>
                )}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {collabs.map(collab => (
                    <div key={collab.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-[10px] border border-gray-100 group/collab transition-all hover:bg-white hover:border-primary/20">
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-black truncate">{collab.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{collab.email}</p>
                      </div>
                      {collab.isAuthor ? (
                        <span className="text-[9px] font-normal uppercase tracking-wider text-primary bg-orange-50 px-2 py-0.5 rounded-full">Tác giả</span>
                      ) : (
                        isOwner && (
                          <button
                            onClick={() => handleRemoveCollab(collab.id)}
                            className="text-[10px] text-rose-500 opacity-0 group-hover/collab:opacity-100 transition-opacity font-normal cursor-pointer"
                          >
                            Xóa
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
