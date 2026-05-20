import BannerCarousel from '@/components/home/BannerCarousel';
import FeaturedPosts from '@/components/home/FeaturedPosts';
import RecentPosts from '@/components/home/RecentPosts';
import HomeSidebar from '@/components/home/HomeSidebar';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-white font-sans">
      {/* Full-width Carousel sát Header */}
      <div className="w-full">
        <BannerCarousel />
      </div>

      <main className="w-full max-w-6xl mx-auto px-4 py-12 flex-1 space-y-16">
        {/* Featured Posts - Chiếm toàn bộ chiều rộng container */}
        <FeaturedPosts />

        {/* Recent Posts + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Recent Posts */}
          <div className="lg:col-span-2">
            <RecentPosts />
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1">
            <HomeSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
