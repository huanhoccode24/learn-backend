import { LogoutButton } from '@/components/auth/logout-button';
import { currentUser, isAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import { User as UserIcon, LayoutDashboard, Settings, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default async function DashboardPage() {
  const user = await currentUser();
  const isUserAdmin = await isAdmin();

  if (isUserAdmin) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 animate-in fade-in duration-1000">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Bảng điều khiển' }]} />
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
              Chào mừng, {user?.name?.split(' ')[0] || 'Member'}!
            </h1>
            <p className="text-slate-400 font-medium">Bảng điều khiển cá nhân của bạn đã sẵn sàng.</p>
          </div>
          <LogoutButton className="bg-slate-900 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-800 transition-all rounded-[10px] px-6 py-3" />
        </header>

        {/* Profile Quick Card */}
        <Card className="overflow-hidden border-slate-800/50 bg-slate-900/20 backdrop-blur-xl group">
          <CardContent className="p-0">
             <div className="p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-slate-700 p-1 shrink-0 group-hover:border-indigo-500 transition-colors duration-500">
                    {user?.image ? (
                        <div className="relative w-full h-full">
                            <Image 
                                src={user.image} 
                                alt="Avatar" 
                                fill
                                className="rounded-[10px] object-cover" 
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-[10px] bg-indigo-500/10 flex items-center justify-center">
                            <UserIcon className="w-10 h-10 text-indigo-500" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-slate-400">{user?.email}</p>
                    <div className="flex gap-2 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20">
                            Member
                        </span>
                        <span className="px-3 py-1 bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            Dự án Blog
                        </span>
                    </div>
                </div>

                <Link href="/dashboard/profile">
                    <button className="px-6 py-3 bg-white text-[#020617] font-black rounded-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
                        Thiết lập hồ sơ
                        <Settings className="w-4 h-4" />
                    </button>
                </Link>
             </div>
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
                icon={BookOpen} 
                title="Khám phá Blog" 
                desc="Đọc những bài viết mới nhất từ cộng đồng."
                href="/blog"
                color="text-blue-400"
            />
            <FeatureCard 
                icon={LayoutDashboard} 
                title="Hoạt động" 
                desc="Xem lại các bình luận và tương tác của bạn."
                href="#"
                color="text-purple-400"
            />
            <FeatureCard 
                icon={Settings} 
                title="Bảo mật" 
                desc="Quản lý mật khẩu và các thiết bị liên kết."
                href="/dashboard/profile"
                color="text-amber-400"
            />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  color: string;
}

function FeatureCard({ icon: Icon, title, desc, href, color }: FeatureCardProps) {
    return (
        <Link href={href}>
            <Card className="h-full border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-300 group">
                <CardContent className="p-8 space-y-4">
                    <div className={`w-12 h-12 rounded-[10px] bg-white/5 flex items-center justify-center ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                    <div className="pt-4 flex items-center text-xs font-bold text-slate-500 group-hover:text-white transition-colors">
                        Xem thêm <ArrowRight className="w-4 h-4 ml-2 group-hover:ml-3 transition-all" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

