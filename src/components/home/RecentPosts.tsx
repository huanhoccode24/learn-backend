'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Loader2, ChevronDown } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  description: string | null;
  createdAt: string;
  authorName: string | null;
  categoryName: string | null;
}



const fetchRecentPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get('/api/posts?limit=4');
  return data;
};



export default function RecentPosts() {
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ['recent-posts'],
    queryFn: fetchRecentPosts,
  });



  const isLoading = isLoadingPosts;

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      <div className="flex items-center gap-5 mb-6">
        <h2 className="text-[18px] font-black text-slate-900 uppercase tracking-widest whitespace-nowrap">
          Recent Posts
        </h2>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <Link
            href={`/blog/${post.slug}`}
            key={post.id}
            className="group flex flex-col bg-transparent rounded-[10px] p-4 transition-all duration-300 hover:bg-primary border border-transparent"
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-16/10 overflow-hidden rounded-[10px] mb-5">
              {post.thumbnail ? (
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Image</span>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-1 px-1 pb-2">
              <h3 className="text-[18px] font-bold text-slate-900 group-hover:text-white! transition-colors line-clamp-2 leading-snug mb-4">
                {post.title}
              </h3>
              
              <div className="mt-auto flex items-center justify-between">
                {post.categoryName && (
                  <span className="px-4 py-1.5 bg-white text-slate-700 group-hover:text-primary! text-[12px] font-medium rounded-full border border-slate-100">
                    {post.categoryName}
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-orange-100!">
                  {format(new Date(post.createdAt), 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/blog"
          className="group flex items-center gap-2 text-slate-900 hover:text-primary transition-colors duration-300"
        >
          <span className="text-[14px] font-bold tracking-tight">Load more posts</span>
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
        </Link>
      </div>
    </div>
  );
}
