'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  Loader2, 
  CornerDownRight, 
  Send, 
  X, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import Image from 'next/image';

interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  userName: string;
  userImage: string | null;
  postTitle: string;
  postSlug: string;
}

export default function CollaboratorCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        const res = await axios.get('/api/collaborator/comments');
        if (isMounted) {
          setComments(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải bình luận:', err);
        toast('Không thể tải danh sách bình luận.', 'error');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, toast]);

  const handleReplySubmit = async (e: React.FormEvent, comment: Comment) => {
    e.preventDefault();
    if (!replyText || replyText.trim() === '' || submitting) return;

    setSubmitting(true);
    try {
      // Quy tắc lồng bình luận:
      // Nếu comment gốc có parentId -> reply của nó vẫn gom dưới root comment đó (parentId = comment.parentId).
      // Nếu comment gốc không có parentId -> reply có parentId = comment.id.
      const parentId = comment.parentId || comment.id;

      await axios.post('/api/comments', {
        postId: comment.postId,
        content: replyText.trim(),
        parentId
      });

      toast('Gửi phản hồi thành công!', 'success');
      setReplyText('');
      setReplyToId(null);
      // Kích hoạt làm mới danh sách bình luận
      setRefreshTrigger(prev => prev + 1);
    } catch (err: unknown) {
      console.error('Lỗi khi gửi phản hồi:', err);
      let errorMsg = 'Có lỗi xảy ra, vui lòng thử lại.';
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.error || errorMsg;
      }
      toast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHrs < 24) return `${diffHrs} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-12 h-12 animate-spin text-rose-500 mb-4" />
        <p className="font-bold text-lg">Đang tải danh sách bình luận...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 duration-700 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-black! tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Bình luận của tôi
          </h1>
          <p className="text-gray-500 font-medium">Theo dõi và trả lời nhanh bình luận của độc giả trên các bài viết của bạn.</p>
        </div>
      </div>

      {/* Filter/Search Bar */}
      <div className="relative max-w-xl">
        <input
          type="text"
          placeholder="Tìm kiếm theo người dùng, nội dung hoặc tiêu đề bài viết..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-4 pr-10 bg-white border border-primary! rounded-[8px] text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div 
              key={comment.id} 
              className="bg-white border border-gray-100 rounded-[12px] p-6 shadow-xs hover:border-primary/20 transition-all space-y-4"
            >
              {/* Comment Header Info */}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {comment.userImage ? (
                    <Image
                      src={comment.userImage}
                      alt={comment.userName}
                      width={44}
                      height={44}
                      unoptimized
                      className="w-11 h-11 rounded-full object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-primary font-bold text-base select-none">
                      {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  
                  {/* User info & Date */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        @{comment.userName}
                      </span>
                      {comment.parentId ? (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold">
                          Phản hồi
                        </span>
                      ) : (
                        <span className="bg-orange-50 text-primary px-2 py-0.5 rounded-[4px] text-[10px] font-semibold">
                          Bình luận gốc
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs font-normal">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Link to public article */}
                <Link 
                  href={`/blog/${comment.postSlug}`} 
                  target="_blank" 
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-bold bg-orange-50/50 px-3 py-1.5 rounded-[6px] border border-orange-100/50 transition-colors"
                >
                  <span className="max-w-[200px] truncate">{comment.postTitle}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </div>

              {/* Comment Content */}
              <div className="bg-slate-50 border border-slate-100/80 rounded-[8px] p-4 text-slate-800 text-sm leading-relaxed">
                {comment.content}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {replyToId === comment.id ? (
                  <button
                    onClick={() => {
                      setReplyToId(null);
                      setReplyText('');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition-colors px-3 py-1.5 rounded-[4px] border border-gray-200"
                  >
                    <X className="w-4 h-4" />
                    Hủy bỏ
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setReplyToId(comment.id);
                      setReplyText('');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-[#d85c39] transition-colors px-4 py-2 rounded-[4px]"
                  >
                    <CornerDownRight className="w-4 h-4" />
                    Trả lời
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyToId === comment.id && (
                <form 
                  onSubmit={(e) => handleReplySubmit(e, comment)}
                  className="mt-3 pl-0 sm:pl-4 border-l-2 border-primary/20 space-y-3 animate-in slide-in-from-top-2 duration-200"
                >
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Trả lời @${comment.userName}...`}
                    rows={3}
                    className="w-full border-2 border-slate-200 rounded-[6px] p-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-primary transition"
                    required
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyToId(null);
                        setReplyText('');
                      }}
                      className="border border-slate-300 text-slate-500 text-xs font-bold px-4 py-2 rounded-[4px] hover:bg-slate-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-[4px] hover:bg-[#d85c39] transition-colors flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Gửi phản hồi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-100 rounded-[12px] p-12 text-center text-gray-400">
            Không tìm thấy bình luận nào.
          </div>
        )}
      </div>
    </div>
  );
}
