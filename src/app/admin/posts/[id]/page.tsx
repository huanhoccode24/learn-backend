'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { Post } from '@/types/post';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { Check, XCircle, Trash2, Loader2, Bookmark, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface Heading { id: string; text: string; level: number }

// Hook để tạo Mục Lục (TOC) - Copy chính xác từ src/app/blog/[slug]/page.tsx
function useHeadings(dependency: Post | null) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!dependency) return;

    // Timeout để đợi HTML render ra
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('.prose h2, .prose h3, .prose h4')) as HTMLElement[];
      const headingData = elements.map((elem, index) => {
        let id = elem.id;
        if (!id) {
          id = `heading-${index}`;
          elem.id = id;
        }
        return {
          id,
          text: elem.innerText,
          level: Number(elem.tagName.replace('H', ''))
        };
      });
      setHeadings(headingData);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: '0px 0px -80% 0px' }
      );

      elements.forEach((elem) => observer.observe(elem));
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [dependency]);

  return { headings, activeId };
}

// Copy chính xác logic xử lý code block từ trang blog của user
function injectCodeBlockStyles() {
  const preElements = document.querySelectorAll('.prose pre');

  preElements.forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-wrapper-v2')) return;
    if (!pre.textContent || pre.textContent.trim() === '') return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper-v2 my-8 rounded-[12px] overflow-hidden bg-[#121214] border border-[#27272a] shadow-2xl shadow-black/50 relative';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between px-4 py-3 bg-[#18181b] border-b border-[#27272a] text-slate-200 text-sm font-medium select-none';

    const titleObj = document.createElement('div');
    titleObj.className = 'flex items-center gap-2.5 tracking-wide';
    titleObj.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-slate-400" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> Code`;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'text-slate-400 hover:text-white transition cursor-pointer p-1.5 rounded-md hover:bg-[#27272a]';
    copyBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

    copyBtn.onclick = () => {
      const code = pre.textContent || '';
      navigator.clipboard.writeText(code);
      copyBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>`;
      setTimeout(() => {
        copyBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      }, 2000);
    };

    header.appendChild(titleObj);
    header.appendChild(copyBtn);
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(header);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'overflow-x-auto p-4 text-[14px] leading-relaxed relative flex';

    const linesCount = (pre.textContent || '').split('\n').length;
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'w-10 text-right pr-5 text-slate-500/50 select-none flex flex-col font-mono text-[14px] leading-relaxed';
    for (let i = 1; i <= linesCount; i++) {
      const span = document.createElement('span');
      span.textContent = String(i);
      lineNumbers.appendChild(span);
    }

    pre.className = "m-0 p-0 bg-transparent flex-1 text-slate-300 font-mono";
    contentWrapper.appendChild(lineNumbers);
    contentWrapper.appendChild(pre);
    wrapper.appendChild(contentWrapper);
  });
}

export default function AdminPostViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const { headings, activeId } = useHeadings(post);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        const { data } = await axios.get(`/api/admin/posts/${id}`);
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, reason }: { status: string, reason?: string }) => {
      const { data } = await axios.patch(`/api/admin/posts/${id}`, { status, rejectionReason: reason });
      return data;
    },
    onSuccess: (data) => {
      setPost(data);
      toast(`Đã ${data.status === 'PUBLISHED' ? 'duyệt' : 'từ chối'} bài viết thành công`);
      setIsRejectModalOpen(false);
      setRejectionReason('');
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast(error.response?.data?.error || 'Đã có lỗi xảy ra', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/admin/posts/${id}`);
    },
    onSuccess: () => {
      toast('Đã gỡ bỏ bài viết thành công');
      router.push('/admin/posts');
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast(error.response?.data?.error || 'Lỗi khi gỡ bỏ', 'error');
    }
  });

  const handleApprove = () => {
    if (confirm('Bạn có chắc chắn muốn duyệt bài viết này?')) {
      updateStatusMutation.mutate({ status: 'PUBLISHED' });
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast('Vui lòng nhập lý do từ chối', 'error');
      return;
    }
    updateStatusMutation.mutate({ status: 'REJECTED', reason: rejectionReason });
  };

  const handleRemove = () => {
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    if (post) {
      injectCodeBlockStyles();
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#E96E4A] animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold text-black mb-4">Không tìm thấy bài viết</h2>
        <Button onClick={() => router.push('/admin/posts')} variant="outline">Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-orange-100 font-sans antialiased">

      {/* Admin Sticky Header */}
      <div className="sticky top-0 z-100 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-1">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-black">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-black">Chế độ xem quản trị</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Trạng thái: {post.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.status === 'PENDING' && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={updateStatusMutation.isPending}
                  className="h-[32px] px-4 text-[11px] font-bold bg-emerald-500! hover:bg-emerald-600! text-white! gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Duyệt bài
                </Button>
                <Button
                  onClick={() => setIsRejectModalOpen(true)}
                  variant="outline"
                  className="h-[32px] px-4 text-[11px] font-bold text-red-500! border-red-100 hover:bg-red-50! gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Từ chối
                </Button>
              </>
            )}
            <Button
              onClick={handleRemove}
              variant="outline"
              disabled={deleteMutation.isPending}
              className="h-[32px] px-4 text-[11px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 border-gray-100 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Gỡ bỏ
            </Button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .prose ul, .prose ol { list-style: none; padding-left: 0; margin-bottom: 2rem; }
        .prose ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.75rem; color: #4b5563; font-size: 1.1rem; line-height: 1.8; }
        .prose ul li::before {
          content: '•';
          position: absolute;
          left: 0.2rem;
          color: #E96E4A;
          font-size: 1.5em;
          line-height: inherit;
        }
        .prose p { margin-bottom: 1.75rem; line-height: 1.5; color: #374151; font-size: 1.1rem; font-family: ui-sans-serif, system-ui, sans-serif; text-wrap: pretty; }
        .prose strong { color: #111827!important; font-weight: 700; }
        .prose h1, .prose h2, .prose h3, .prose h4 { color: #111827!important; font-weight: 800; margin-top: 3rem; margin-bottom: 1.25rem; letter-spacing: -0.025em; }
        .prose h2 { font-size: 1.875rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.75rem; }
        .prose h3 { font-size: 1.5rem; }
        .prose a { color: #E96E4A; text-decoration: none; font-weight: 500; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
        .prose a:hover { border-bottom-color: #E96E4A; }
        .prose img { border-radius: 1rem; margin: 2.5rem 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .prose blockquote { border-left: 4px solid #E96E4A; padding-left: 1.5rem; font-style: italic; color: #4B5563; margin: 2rem 0; font-size: 1.25rem; }
      `}} />

      <div className="max-w-[1240px] mx-auto px-4 pt-4 pb-12 lg:pt-6 lg:pb-16">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative">

          {/* Main Content (Left) */}
          <article className="w-full lg:w-[70%]">
            <header className="mb-10">
              <h1 className="text-3xl md:text-[2.75rem] font-extrabold tracking-tight mb-6 leading-[1.3] text-[#111827]!">
                {post.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2 font-medium text-gray-600!">
                  <span>{new Date(post.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>

                <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>

                {post.categoryName && (
                  <>
                    <div className="inline-flex py-1 px-3 bg-gray-100 border border-gray-200 rounded-full text-gray-600 font-medium text-xs">
                      {post.categoryName}
                    </div>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>
                  </>
                )}

                <div className="flex items-center gap-3">
                  <div className="relative w-7 h-7 rounded-full bg-orange-100 border border-orange-200 overflow-hidden flex items-center justify-center font-bold text-[10px] text-orange-600 uppercase">
                    {post.authorImage ? (
                      <Image src={post.authorImage} alt={post.authorName || 'Author'} fill className="object-cover" />
                    ) : (
                      post.authorName?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="flex flex-col leading-tight text-gray-700!">
                    <span className="font-semibold text-gray-700!">{post.authorName || 'Admin'}</span>
                    <span className="text-[10px] text-gray-400!">Author</span>
                  </div>
                </div>
              </div>
            </header>

            {post.description && (
              <div className="mb-10 bg-orange-50/50 border border-gray-100 border-l-[3px] border-l-[#E96E4A] rounded-r-lg p-6">
                <p className="text-gray-600 italic text-base md:text-lg leading-relaxed font-serif">
                  {post.description}
                </p>
              </div>
            )}

            {post.thumbnail && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 border border-gray-100 shadow-xl">
                <Image src={post.thumbnail} alt={post.title} fill className="object-cover" priority />
              </div>
            )}

            <div
              ref={contentRef}
              className="prose prose-slate max-w-none w-full"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-gray-400 text-sm">
              <p>© 2026 Blog Kỹ thuật. Chế độ xem Quản trị viên.</p>
            </div>
          </article>

          {/* Table of Contents (Right) */}
          <aside className="w-full lg:w-[30%] relative hidden lg:block">
            <div className="sticky top-[60px] bg-white pt-4 pb-8 z-10">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Bookmark className="w-5 h-5 text-[#E96E4A]" />
                <h3 className="text-lg font-bold text-black tracking-wide uppercase">Mục Lục</h3>
              </div>
              {headings.length === 0 ? (
                <p className="text-gray-400 text-sm">Đang tải...</p>
              ) : (
                <nav className="flex flex-col gap-1 text-[14px]">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`transition-all duration-200 leading-relaxed block border-l-2 pl-3 py-1.5 rounded-r-md
                        ${activeId === h.id
                          ? 'text-[#E96E4A] font-semibold border-[#E96E4A] bg-orange-50/5'
                          : 'text-gray-500 border-transparent hover:text-black hover:bg-gray-50 hover:border-gray-300'
                        }
                        ${h.level === 3 ? 'ml-4 text-[13px]' : ''}
                        ${h.level === 4 ? 'ml-8 text-[12px]' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span className="line-clamp-2">{h.text}</span>
                    </a>
                  ))}
                </nav>
              )}
            </div>
          </aside>

        </div>
      </div>

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8">
            <h3 className="text-[18px] font-bold text-black mb-1">Từ chối bài viết</h3>
            <p className="text-[13px] text-gray-400 mb-6 font-normal">Vui lòng cung cấp lý do để tác giả biết cần chỉnh sửa gì.</p>

            <textarea
              className="w-full bg-gray-50 border border-gray-100 rounded-[12px] p-4 text-[14px] text-black min-h-[120px] focus:outline-none focus:border-orange-500 transition-all mb-6 placeholder:text-gray-300"
              placeholder="Nhập lý do tại đây..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason('');
                }}
                className="rounded-[10px] h-[40px] px-6 text-[13px] font-normal border-gray-100 hover:bg-gray-50"
              >
                Hủy
              </Button>
              <Button
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
                className="bg-red-500! hover:opacity-90 text-white! rounded-[10px] h-[40px] px-6 text-[13px] font-bold shadow-sm flex items-center gap-2"
              >
                {updateStatusMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-[#E96E4A]" />
            </div>

            <h3 className="text-[20px] font-bold text-black mb-2">Xác nhận gỡ bỏ bài viết?</h3>
            <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
              Hành động này sẽ xóa vĩnh viễn bài viết <span className="font-bold text-black">&quot;{post.title}&quot;</span>.
              Bạn sẽ không thể khôi phục lại dữ liệu này.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-[12px] h-[48px] text-[14px] font-medium border-gray-100 hover:bg-gray-50 text-gray-500"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="bg-[#E96E4A]! hover:opacity-90 text-white! rounded-[12px] h-[48px] text-[14px] font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Xác nhận gỡ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
