'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import axios from 'axios';
import {
  Search,
  User,
  Heart,
  LogOut,
  ChevronDown,
  FileText,
  X,
  Loader2,
} from 'lucide-react';

// ==================== SEARCH RESULT TYPE ====================
interface SearchResult {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryName?: string;
  authorName?: string;
  thumbnail?: string;
}

// ==================== MAIN HEADER COMPONENT ====================
export default function UserHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);



  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/blog', label: 'Bài viết' },
    { href: '/authors', label: 'Cộng tác viên' },
    { href: '#', label: 'Khóa học', disabled: true },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Close dropdown & search on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Debounced search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setShowSearchResults(true);
    setIsSearching(true);

    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/posts?search=${encodeURIComponent(query.trim())}`);
        setSearchResults(res.data.slice(0, 6));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, []);

  const handleResultClick = (slug: string) => {
    setShowSearchResults(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(`/blog/${slug}`);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Ẩn Header trên admin, auth pages (Đặt sau các Hook)
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/collaborator') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/verify')
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/60">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16">

          {/* Mobile Menu Toggle (Chỉ hiện trên mobile, đặt trước logo) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-transparent hover:bg-slate-50 transition-all text-slate-500 hover:text-slate-900 shrink-0 -ml-2.5 mr-1"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* ===== LEFT: Logo ===== */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="hidden md:flex items-center justify-center min-w-[32px]">
                <span className="text-[22px] font-black text-[#E96E4A]! tracking-tighter leading-none select-none">BLH</span>
              </div>
              <div className="hidden md:block h-8 w-px bg-slate-100 mx-1"></div>
              <div>
                <h2 className="text-[18px] font-black text-[#E96E4A]! tracking-tighter leading-none">BitelleLearnHub</h2>
              </div>
            </Link>
          </div>

          {/* ===== CENTER: Navigation (căn giữa) ===== */}
          <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.disabled ? '#' : link.href}
                className={`relative flex items-center gap-1.5 py-5 text-sm font-semibold transition-all duration-200 ${link.disabled
                  ? 'text-slate-600 cursor-not-allowed'
                  : isActive(link.href)
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
                onClick={(e) => link.disabled && e.preventDefault()}
              >
                {link.label}
                {link.disabled && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/15 text-orange-500 rounded-md font-bold uppercase tracking-wider">
                    Soon
                  </span>
                )}
                {/* Underline indicator */}
                {!link.disabled && isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" style={{ animation: 'slideInLeft 0.3s ease-out' }} />
                )}
              </Link>
            ))}
          </nav>

          {/* ===== RIGHT: Search Icon + Account ===== */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">

            {/* Search: Icon mặc định, mở rộng khi bấm */}
            <div ref={searchRef} className="relative hidden md:block">
              {!isSearchOpen ? (
                /* Icon Search mặc định */
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 transition-all text-slate-500 hover:text-slate-900"
                  aria-label="Tìm kiếm"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
              ) : (
                /* Thanh Search mở rộng */
                <div className="relative animate-in fade-in slide-in-from-right-4 duration-200">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Tìm kiếm bài viết..."
                    className="w-64 lg:w-80 h-10 pl-10 pr-9 bg-slate-50/80 border border-orange-500/40 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                  />
                  <button
                    onClick={closeSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                    aria-label="Đóng tìm kiếm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && isSearchOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[400px] max-h-[420px] overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[10px] shadow-2xl shadow-slate-200/40 animate-in fade-in slide-in-from-top-2 duration-200">
                  {isSearching ? (
                    <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                      <span className="text-sm font-medium">Đang tìm kiếm...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Kết quả ({searchResults.length})
                      </p>
                      {searchResults.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => handleResultClick(post.slug)}
                          className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-left group"
                        >
                          {post.thumbnail ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                              <Image
                                src={post.thumbnail}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-orange-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                              {post.title}
                            </p>
                            {post.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {post.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              {post.categoryName && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded-md font-bold">
                                  {post.categoryName}
                                </span>
                              )}
                              {post.authorName && (
                                <span className="text-[10px] text-slate-600">
                                  bởi {post.authorName}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                      <Search className="w-8 h-8 mb-3 text-slate-600" />
                      <p className="text-sm font-medium">Không tìm thấy bài viết nào</p>
                      <p className="text-xs text-slate-600 mt-1">Thử từ khóa khác nhé</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Dropdown / Login Button */}
            {session?.user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-xl bg-transparent hover:bg-slate-50 transition-all group"
                  aria-label={session.user.name || 'Tài khoản'}
                >
                  <div className="relative">
                    <div className="relative w-7 h-7 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center overflow-hidden border border-white/10">
                      {session.user.image ? (
                        <Image src={session.user.image} alt="User Avatar" fill className="object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 hidden lg:block max-w-[100px] truncate">
                    {session.user.name || 'Tài khoản'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[10px] shadow-2xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3.5 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{session.user.name}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{session.user.email}</p>
                    </div>

                    <div className="p-1.5">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Tài khoản
                      </Link>
                      <button
                        disabled
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed"
                      >
                        <Heart className="w-4 h-4" />
                        Yêu thích
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-orange-500/15 text-orange-500 rounded-md font-bold uppercase">Soon</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 p-1.5">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut({ callbackUrl: '/login' });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="h-10 px-5 flex items-center gap-2 rounded-xl bg-primary hover:bg-[#d15d3b] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
              >
                <User className="w-4 h-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.disabled ? '#' : link.href}
                onClick={(e) => {
                  if (link.disabled) e.preventDefault();
                  else setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${link.disabled
                  ? 'text-slate-600 cursor-not-allowed'
                  : isActive(link.href)
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {link.label}
                {link.disabled && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/15 text-orange-500 rounded-md font-bold uppercase">Soon</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

