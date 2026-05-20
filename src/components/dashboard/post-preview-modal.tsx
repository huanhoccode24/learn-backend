'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Post } from '@/types/post';
import { X, Loader2, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

export default function PostPreviewModal({ isOpen, onClose, postId }: PostPreviewModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && postId) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/admin/posts/${postId}`);
          setPost(data);
        } catch (error) {
          console.error('Error fetching post for preview:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }

    // Cleanup function: Reset post data when modal closes or postId changes
    return () => {
      setPost(null);
    };
  }, [isOpen, postId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-white animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-[70px] border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#E96E4A]" />
          </div>
          <div>
            <h2 className="text-[16px] font-medium text-black">Bản xem trước bài viết</h2>
            <p className="text-[12px] text-gray-400">Chế độ xem của Admin</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
        >
          <X className="w-6 h-6 text-gray-400 group-hover:text-black" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#E96E4A] mb-4" />
            <p className="text-gray-400 text-sm">Đang tải nội dung xem trước...</p>
          </div>
        ) : post ? (
          <div className="max-w-[900px] mx-auto bg-white min-h-screen my-8 shadow-2xl shadow-black/5 rounded-[24px] overflow-hidden border border-gray-100">
            {/* Post Header */}
            <div className="p-10 md:p-16 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-orange-50 text-[#E96E4A] text-[11px] font-medium rounded-full uppercase tracking-wider border border-orange-100">
                  {post.categoryName || 'Bản tin'}
                </span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <h1 className="text-[32px] md:text-[42px] font-bold text-black leading-tight mb-8 tracking-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative">
                  {post.authorImage ? (
                    <Image src={post.authorImage} alt={post.authorName || 'Author'} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-[#E96E4A] font-bold">
                      {post.authorName?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-black">{post.authorName || 'Admin'}</span>
                  <span className="text-[12px] text-gray-400">Tác giả bài viết</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {post.description && (
              <div className="px-10 md:px-16 py-8 bg-gray-50/50 italic text-[16px] md:text-[18px] text-gray-600 leading-relaxed border-l-4 border-[#E96E4A] mx-10 md:mx-16 mt-10 rounded-r-xl font-serif">
                &quot;{post.description}&quot;
              </div>
            )}

            {/* Thumbnail */}
            {post.thumbnail && (
              <div className="px-10 md:px-16 pt-10">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                  <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="p-10 md:p-16">
              <style dangerouslySetInnerHTML={{ __html: `
                .preview-prose { color: #374151; font-size: 1.125rem; line-height: 1.8; }
                .preview-prose p { margin-bottom: 1.5rem; }
                .preview-prose h2 { font-size: 1.875rem; font-weight: 700; color: #111827; margin-top: 2.5rem; margin-bottom: 1.25rem; }
                .preview-prose h3 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 1rem; }
                .preview-prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                .preview-prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                .preview-prose img { border-radius: 0.75rem; margin: 2rem 0; }
                .preview-prose blockquote { border-left: 4px solid #E96E4A; padding-left: 1.5rem; font-style: italic; color: #4B5563; margin: 2rem 0; }
                .preview-prose code { background: #F3F4F6; padding: 0.2rem 0.4rem; rounded: 0.25rem; font-family: monospace; font-size: 0.9em; }
                .preview-prose pre { background: #1F2937; color: #F9FAFB; padding: 1.5rem; border-radius: 0.75rem; overflow-x: auto; margin: 2rem 0; }
              `}} />
              <div 
                ref={contentRef}
                className="preview-prose max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Footer */}
            <div className="p-10 md:p-16 bg-gray-50 border-t border-gray-100 flex flex-col items-center justify-center text-center">
              <p className="text-[13px] text-gray-400 mb-2">© 2026 Blog Hệ thống. Tất cả nội dung đã được bảo mật.</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] text-emerald-600 font-medium uppercase tracking-widest">Admin Preview Mode</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Không tìm thấy dữ liệu bài viết.</p>
          </div>
        )}
      </div>
    </div>
  );
}
