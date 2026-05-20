'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  facebookLink?: string;
  githubLink?: string;
  role: string;
}

export default function CollaboratorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuthors() {
      try {
        const res = await axios.get('/api/authors');
        setAuthors(res.data);
      } catch (error) {
        console.error('Error fetching authors:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAuthors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Đội ngũ cộng tác viên của BitelleLearnHub
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Những chuyên gia và những người đam mê chia sẻ tri thức về lập trình.
          </p>
        </div>
      </section>

      {/* Authors Grid */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        {authors.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-16">
            {authors.map((author) => (
              <div key={author.id} className="group flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-50 shadow-xl group-hover:border-primary/20 transition-colors"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100">
                    {author.image ? (
                      <Image
                        src={author.image}
                        alt={author.name || 'Author'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300">
                        {author.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">
                  {author.name || 'Ẩn danh'}
                </h2>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {author.bio || 'Collaborator'}
                </p>

                {/* Socials (Sample) */}
                <div className="flex items-center gap-3 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {author.facebookLink && (
                    <Link href={author.facebookLink} target="_blank" className="text-slate-400 hover:text-[#3b5998]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </Link>
                  )}
                  <Link href="#" className="text-slate-400 hover:text-slate-900">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </Link>
                  <Link href="#" className="text-slate-400 hover:text-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <svg className="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h1.1"></path><path d="M3 10.5h0"></path><path d="M21 16h0"></path><path d="M8 10.5h0"></path><path d="M12 10.5h0"></path><path d="M16 10.5h0"></path><path d="M8 16h0"></path><path d="M12 16h0"></path><path d="M16 16h0"></path></svg>
            <p className="text-slate-400 font-medium text-lg">Chưa có cộng tác viên nào trong danh sách.</p>
          </div>
        )}
      </main>
    </div>
  );
}
