'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Post, Category } from '@/types';
import { Button } from '@/components/ui';
import { Search, Calendar, ChevronRight, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchData = async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        axios.get(`/api/posts?search=${search}&category=${selectedCategory}`),
        axios.get('/api/categories')
      ]);
      setPosts(postsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to fetch blog data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        setLoading(true);
        await fetchData();
      }
    };
    load();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchData();
  };

  // Tính toán tiêu đề trang dựa trên danh mục được chọn
  const pageTitle = useMemo(() => {
    if (!selectedCategory) return 'Bài viết';
    const cat = categories.find(c => c.slug === selectedCategory);
    return cat ? cat.name : 'Bài viết';
  }, [selectedCategory, categories]);

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Hero Section - Banner đẹp hơn với hình nền AI */}
      <div className="relative py-20 overflow-hidden border-b border-slate-100">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/blog-banner.png"
            alt="Banner background"
            fill
            className="object-cover opacity-40 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-white/80 via-white/60 to-white"></div>
        </div>

        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent -z-10 animate-pulse duration-4000"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-orange-500 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            Khám phá tri thức
          </h2>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 bg-linear-to-r from-slate-900 via-orange-900 to-primary bg-clip-text text-transparent leading-tight">
            Nơi chia sẻ kinh nghiệm & <br className="hidden md:block" /> kiến thức lập trình
          </h1>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group mt-8">
            <div className="absolute -inset-1 bg-linear-to-r from-orange-500 to-red-600 rounded-full blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài viết ngay..."
                className="w-full bg-white border border-slate-200 rounded-full py-4 pl-14 pr-32 text-base focus:outline-none focus:border-orange-500/50 transition-all backdrop-blur-xl shadow-2xl shadow-slate-200/50"
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-orange-500 text-white rounded-full px-6 py-2 h-10 font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30">
                Tìm kiếm
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Page Title & Horizontal Categories */}
        <div className="space-y-8 mb-12 animate-in fade-in duration-700">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Blog' }]} />
        </div>

        <h2 className="text-4xl font-black text-slate-900">{pageTitle}</h2>

          <div className="flex items-center gap-8 overflow-x-auto pb-4 scrollbar-hide border-b border-slate-100">
            <button
              onClick={() => setSelectedCategory('')}
              className={`relative py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${selectedCategory === '' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              All
              {selectedCategory === '' && (
                <div className="absolute -bottom-px left-0 w-full h-0.5 bg-orange-500 rounded-full" style={{ animation: 'slideInLeft 0.3s ease-out' }} />
              )}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`relative py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat.slug ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {cat.name}
                {selectedCategory === cat.slug && (
                  <div className="absolute -bottom-px left-0 w-full h-0.5 bg-orange-500 rounded-full" style={{ animation: 'slideInLeft 0.3s ease-out' }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid - 3 Cột */}
        <div className="space-y-10 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Đang tải bài viết...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32 bg-slate-50 rounded-[30px] border border-dashed border-slate-200 scale-95 opacity-50">
              <p className="text-slate-400 text-lg">Không tìm thấy bài viết nào phù hợp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group h-full">
                  <div className="flex flex-col h-full bg-white border border-slate-200 rounded-[10px] p-4 transition-all duration-300 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1">
                    <div className="relative aspect-video overflow-hidden rounded-[10px] border border-slate-100 mb-5">
                      {post.thumbnail ? (
                        <Image
                          src={post.thumbnail}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                          <Tag className="h-12 w-12 text-slate-800" />
                        </div>
                      )}
                      {/* Overlay gradient khi hover */}
                      <div className="absolute inset-0 bg-linear-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <div className="space-y-3 flex-1 flex flex-col px-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg">
                          {post.categoryName}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 text-sm line-clamp-2 mt-auto">
                        {post.description ? post.description : post.content.replace(/<[^>]*>?/gm, '')}
                      </p>

                      <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-100 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500 group-hover:translate-x-1 transition-transform">
                          Đọc tiếp <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
