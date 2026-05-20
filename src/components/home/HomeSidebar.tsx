'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';


interface Category {
  id: string;
  name: string;
  count?: number;
}

const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await axios.get('/api/categories');
  return data;
};

export default function HomeSidebar() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['home-categories'],
    queryFn: fetchCategories,
  });

  return (
    <div className="space-y-16">
      {/* Categories Section */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-widest whitespace-nowrap">
            Categories
          </h3>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        
        <div className="flex flex-col divide-y divide-slate-100">
          {(categories.length > 0 ? categories : [
            { id: '1', name: 'Lifestyle', count: 451 },
            { id: '2', name: 'Fashion', count: 230 },
            { id: '3', name: 'Technology', count: 40 },
            { id: '4', name: 'Travel', count: 38 },
            { id: '5', name: 'Health', count: 24 },
          ]).map((cat) => (
            <Link key={cat.id} href={`/blog?category=${cat.name}`} className="flex justify-between items-center py-3 group">
              <span className="text-[16px] font-bold text-slate-900 uppercase tracking-wide group-hover:text-primary transition-colors">
                {cat.name}
              </span>
              <span className="text-[16px] font-medium text-slate-400 group-hover:text-slate-900 transition-colors">
                {cat.count || 0}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
