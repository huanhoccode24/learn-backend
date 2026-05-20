'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Loader2, Zap } from 'lucide-react';

interface FeaturedPost {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  description: string | null;
  categoryName: string | null;
  authorName: string | null;
  createdAt: string;
}

const fetchFeaturedPosts = async (): Promise<FeaturedPost[]> => {
  const { data } = await axios.get('/api/posts/featured');
  // API returns up to 6 by default
  return data;
};

export default function FeaturedPosts() {
  const { status } = useSession();
  const { data: posts = [], isLoading } = useQuery<FeaturedPost[]>({
    queryKey: ['featured-posts'],
    queryFn: fetchFeaturedPosts,
  });

  if (isLoading || status === 'loading') {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Removed return null if empty to ensure section is visible during development

  // Removed isPremium lock to show the new layout to the user

  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 3);

  if (posts.length === 0) {
    return (
      <div className="w-full animate-in fade-in duration-700">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Tiêu điểm</h2>
          <div className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded uppercase tracking-tighter">Hot</div>
          <div className="flex-1 h-px bg-slate-100 ml-4"></div>
        </div>
        <div className="py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[4px] flex flex-col items-center justify-center text-slate-400">
          <Zap className="w-10 h-10 mb-4 opacity-20" />
          <p className="font-bold">Chưa có bài viết nổi bật nào</p>
          <p className="text-xs">Hãy đánh dấu &apos;Nổi bật&apos; cho các bài viết trong trang quản trị.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      <div className="flex items-center gap-5 mb-6">
        <h2 className="text-[18px] font-black text-slate-900 uppercase tracking-widest whitespace-nowrap">
          Featured Posts
        </h2>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[500px]">
        {/* Main Featured Post (Left) */}
        <div className="lg:col-span-2 relative group overflow-hidden rounded-[10px]">
          <Link href={`/blog/${mainPost.slug}`} className="block w-full h-full">
            <div className="relative w-full h-full min-h-[400px]">
              {mainPost.thumbnail ? (
                <Image src={mainPost.thumbnail} alt={mainPost.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs tracking-widest uppercase">No Image</div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                {mainPost.categoryName && (
                  <span className="inline-block text-[11px] font-black text-rose-500 uppercase tracking-widest mb-3">
                    {mainPost.categoryName}
                  </span>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-5 line-clamp-2 leading-tight group-hover:text-rose-400 transition-colors">
                  {mainPost.title}
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-[2px]">
                  <span>{mainPost.authorName || 'John Doe'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                  <span>{new Date(mainPost.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Side Posts (Right) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {sidePosts.map((post) => (
            <div key={post.id} className="flex-1 relative group overflow-hidden rounded-[10px]">
              <Link href={`/blog/${post.slug}`} className="block w-full h-full">
                <div className="relative w-full h-full min-h-[242px]">
                  {post.thumbnail ? (
                    <Image src={post.thumbnail} alt={post.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs tracking-widest uppercase">No Image</div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    {post.categoryName && (
                      <span className="inline-block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">
                        {post.categoryName}
                      </span>
                    )}
                    <h4 className="text-[17px] font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-rose-400 transition-colors">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-[1px]">
                      <span>{post.authorName || 'John Doe'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                      <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
