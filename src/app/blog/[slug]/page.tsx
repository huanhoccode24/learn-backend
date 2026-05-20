'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Post } from '@/types';
import { notFound } from 'next/navigation';

import { Loader2, Bookmark, MessageCircle, Eye } from 'lucide-react';

import Link from 'next/link';
import Image from 'next/image';

interface Heading { id: string; text: string; level: number }

// Hook để tạo Mục Lục (TOC)
function useHeadings(dependency: Post | null) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!dependency) return;

    // Timeout để đợi HTML render ra
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5')) as HTMLElement[];
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

// Hàm để làm đẹp các block code (DOM manipulation)
function injectCodeBlockStyles() {
  const preElements = document.querySelectorAll('.prose pre');

  preElements.forEach((pre) => {
    // Chỉ xử lý nếu chưa được wrap
    if (pre.parentElement?.classList.contains('code-wrapper-v2')) return;

    // Bỏ qua các thẻ pre rỗng (TinyMCE đôi khi tự sinh ra khi Enter)
    if (!pre.textContent || pre.textContent.trim() === '') return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper-v2 my-8 rounded-[12px] overflow-hidden bg-[#121214] border border-[#27272a] shadow-2xl shadow-black/50 relative';

    // Header của code block
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between px-4 py-3 bg-[#18181b] border-b border-[#27272a] text-slate-200 text-sm font-medium select-none';

    const titleObj = document.createElement('div');
    titleObj.className = 'flex items-center gap-2.5 tracking-wide';
    titleObj.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-slate-400" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> Bash`;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'text-slate-400 hover:text-white transition cursor-pointer p-1.5 rounded-md hover:bg-[#27272a]';
    copyBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

    // Xử lý sự kiện Copy
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

    // Chèn vào cây DOM
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(header);

    // Nội dung code
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'overflow-x-auto p-4 text-[14px] leading-relaxed relative flex';

    // Tạo Line Numbers
    const linesCount = (pre.textContent || '').split('\n').length;
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'w-10 text-right pr-5 text-slate-500/50 select-none flex flex-col font-mono text-[14px] leading-relaxed';
    for (let i = 1; i <= linesCount; i++) {
      const span = document.createElement('span');
      span.textContent = String(i);
      lineNumbers.appendChild(span);
    }

    // Simple regex highlighter
    let rawText = pre.innerHTML;
    rawText = rawText.replace(/\b(install|run|build|start|dev)\b/g, '<span style="color: #2dd4bf;">$1</span>');
    rawText = rawText.replace(/\b(npm|yarn|npx|pip|python|node)\b/g, '<span style="color: #f8fafc; font-weight: 500;">$1</span>');
    pre.innerHTML = rawText;

    pre.className = "m-0 p-0 bg-transparent flex-1 text-slate-300 font-mono"; // reset pre styles
    contentWrapper.appendChild(lineNumbers);
    contentWrapper.appendChild(pre);

    wrapper.appendChild(contentWrapper);
  });
}

export default function BlogPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { headings, activeId } = useHeadings(post);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await axios.get(`/api/posts/${resolvedParams.slug}`);
        setPost(res.data);
        
        // Fetch related posts (Primary: Category, Fallback: Latest)
        let finalRelated: Post[] = [];
        if (res.data.categoryId) {
          const relatedRes = await axios.get(`/api/posts?categoryId=${res.data.categoryId}&limit=5`);
          finalRelated = relatedRes.data.filter((p: Post) => p.slug !== resolvedParams.slug);
        }

        if (finalRelated.length === 0) {
          const fallbackRes = await axios.get(`/api/posts?limit=5`);
          finalRelated = fallbackRes.data.filter((p: Post) => p.slug !== resolvedParams.slug);
        }

        setRelatedPosts(finalRelated.slice(0, 3));
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [resolvedParams.slug]);

  useEffect(() => {
    if (post) {
      injectCodeBlockStyles();
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-700 selection:bg-teal-500/10 font-sans">

      <style dangerouslySetInnerHTML={{
        __html: `
        .prose ul, .prose ol { list-style: none; padding-left: 0; margin-bottom: 2rem; }
        .prose ul li { position: relative; padding-left: 1.5rem; margin-bottom: 0.75rem; color: #1e293b; font-size: 1.125rem; line-height: 1.9; font-family: var(--font-lora), Georgia, serif; }
        .prose ul li::before {
          content: '•';
          position: absolute;
          left: 0.2rem;
          color: #f97316;
          font-size: 1.5em;
          line-height: inherit;
        }
        .prose p { margin-bottom: 2rem; line-height: 1.9; color: #1e293b; font-size: 1.15rem; font-family: var(--font-lora), Georgia, serif; text-wrap: pretty; }
        .prose strong { color: #0f172a; font-weight: 700; }
        .prose h1, .prose h2, .prose h3, .prose h4 { color: #0f172a; font-weight: 800; margin-top: 3.5rem; margin-bottom: 1.5rem; letter-spacing: -0.025em; }
        .prose h2 { font-size: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
        .prose h3 { font-size: 1.75rem; }
        .prose blockquote { border-left: 4px solid #f97316; padding-left: 1.5rem; font-style: italic; color: #475569; margin: 2rem 0; font-size: 1.25rem; }
        .prose table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        .prose th, .prose td { border: 1px solid #e2e8f0; padding: 1rem; text-align: left; }
        .prose th { background-color: #f8fafc; color: #0f172a; font-weight: 600; }
        .prose img { border-radius: 10px; margin: 2.5rem 0; }
      `}} />

      {/* Full Width Hero Header */}
      <section className="relative w-full h-[350px] md:h-[400px] overflow-hidden bg-slate-900">
        {post.thumbnail && (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1240px] mx-auto px-4 w-full pb-16">
            <div className="max-w-4xl animate-in slide-in-from-bottom-8 duration-700">
              {post.categoryName && (
                <span className="inline-block text-[12px] font-black text-rose-500 capitalize tracking-[1px] mb-6">
                  {post.categoryName}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white! mb-8 leading-[1.1] tracking-tight">
                {post.title}
              </h1>
              
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 md:flex md:flex-wrap md:items-center md:gap-6 text-[12px] font-semibold text-slate-300 tracking-[0.5px]">
                <div className="flex items-center gap-2 capitalize">
                  <span className="text-white">{post.authorName || 'John Doe'}</span>
                </div>
                
                <span className="w-1 h-1 rounded-full bg-rose-500 hidden md:inline-block"></span>
                
                <span>{`Ngày ${new Date(post.createdAt).getDate()} tháng ${new Date(post.createdAt).getMonth() + 1} năm ${new Date(post.createdAt).getFullYear()}`}</span>
                
                <span className="w-1 h-1 rounded-full bg-slate-600 hidden md:inline-block"></span>
                
                <div className="flex items-center gap-1.5 capitalize">
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>3 Bình luận</span>
                </div>
                
                <span className="w-1 h-1 rounded-full bg-slate-600 hidden md:inline-block"></span>
                
                <div className="flex items-center gap-1.5 capitalize">
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>807 Lượt xem</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-4 pt-8 md:pt-12 pb-12 md:pb-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative">

          {/* Main Content (Left) */}
          <main className="flex-1 lg:max-w-[800px] animate-in fade-in duration-700">
            {/* Description / Lead (Quote Box Style) */}
            {post.description && (
              <div className="mb-12 p-8 md:p-12 border border-slate-200 rounded-[10px] relative bg-white animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  {/* Quote Icon */}
                  <div className="shrink-0 w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50/50">
                    <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L22.017 3V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM2.017 21L2.017 18C2.017 16.8954 2.9124 16 4.017 16H7.017C7.56928 16 8.017 15.5523 8.017 15V9C8.017 8.44772 7.56928 8 7.017 8H4.017C2.9124 8 2.017 7.10457 2.017 6V3L10.017 3V15C10.017 18.3137 7.33071 21 4.017 21H2.017Z" />
                    </svg>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1">
                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
                      {post.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div
              ref={contentRef}
              className="prose max-w-none w-full"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
              <div className="mt-20 pt-16 border-t border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight shrink-0">Related Posts</h3>
                  <div className="h-px w-full bg-slate-100"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {relatedPosts.map((rPost) => (
                    <Link key={rPost.id} href={`/blog/${rPost.slug}`} className="group block">
                      <div className="relative aspect-16/10 rounded-[10px] overflow-hidden mb-5">
                        {rPost.thumbnail ? (
                          <Image src={rPost.thumbnail} alt={rPost.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300">No Image</div>
                        )}
                      </div>
                      <span className="inline-block text-[11px] font-black text-primary uppercase tracking-widest mb-3">
                        {rPost.categoryName || 'General'}
                      </span>
                      <h4 className="text-[17px] font-black text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-4">
                        {rPost.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>{rPost.authorName || 'John Doe'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{`Ngày ${new Date(rPost.createdAt).getDate()} tháng ${new Date(rPost.createdAt).getMonth() + 1} năm ${new Date(rPost.createdAt).getFullYear()}`}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar Section (Right) */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24">
              <div className="bg-white pt-4 pb-8">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <Bookmark className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-slate-900 tracking-wide uppercase">Mục Lục</h3>
                </div>
                
                {headings.length > 0 ? (
                  <nav
                    className="flex flex-col gap-1 text-[14px] overflow-y-auto pr-2 toc-scrollbar"
                    style={{ maxHeight: 'calc(100vh - 250px)' }}
                  >
                    {headings.map((h, i) => (
                      <a
                        key={i}
                        href={`#${h.id}`}
                        className={`transition-all duration-200 leading-relaxed block border-l-2 pl-3 py-1.5 rounded-r-md
                          ${activeId === h.id
                            ? 'text-orange-600 font-semibold border-orange-500 bg-orange-50'
                            : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300'
                          }
                          ${h.level >= 3 ? `ml-${(h.level - 2) * 4} text-[13px]` : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <span className="line-clamp-2">{h.text}</span>
                      </a>
                    ))}
                  </nav>
                ) : (
                  <p className="text-slate-400 text-sm italic">Bài viết chưa có mục lục (H1-H4)</p>
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
