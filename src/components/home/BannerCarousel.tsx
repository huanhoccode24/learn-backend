'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
}

const fetchBanners = async (): Promise<Banner[]> => {
  const { data } = await axios.get('/api/banners');
  return data;
};

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['public-banners'],
    queryFn: fetchBanners,
  });

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  if (isLoading) {
    return (
      <div className="w-full h-[300px] md:h-[450px] lg:h-[550px] bg-slate-50 flex items-center justify-center animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[300px] md:h-[450px] lg:h-[550px] overflow-hidden group">
      {/* Banners */}
      {banners.map((banner, index) => {
        const isCurrent = index === currentIndex;
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            {banner.link ? (
              <a href={banner.link} target="_blank" rel="noopener noreferrer" className="relative w-full h-full block">
                <Image src={banner.image} alt={banner.title} fill className="object-cover" priority={index === 0} />
                {/* Gradient overlay to make text pop if needed, but keeping it clean like the provided style */}
              </a>
            ) : (
              <div className="relative w-full h-full">
                <Image src={banner.image} alt={banner.title} fill className="object-cover" priority={index === 0} />
              </div>
            )}
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-orange-500 w-8' : 'bg-white/50 hover:bg-white/80'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
