'use client';

import React from 'react';
import { 
  FileText, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { Card } from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Jan', views: 400, posts: 24 },
  { name: 'Feb', views: 300, posts: 13 },
  { name: 'Mar', views: 200, posts: 98 },
  { name: 'Apr', views: 278, posts: 39 },
  { name: 'May', views: 189, posts: 48 },
  { name: 'Jun', views: 239, posts: 38 },
  { name: 'Jul', views: 349, posts: 43 },
];

export default function CollaboratorDashboardPage() {
  return (
    <div className="space-y-10 duration-700 animate-in fade-in">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-black! tracking-tight">Dashboard</h1>
        <p className="text-gray-500 font-medium">Chào mừng bạn quay trở lại, đây là thống kê bài viết của bạn.</p>
      </div>

      {/* Colored Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ColoredStatCard
          title="Tổng bài viết"
          value="12"
          trend="+2 bài mới tháng này"
          icon={FileText}
          bgColor="bg-rose-50"
          iconColor="bg-rose-500"
        />
        <ColoredStatCard
          title="Lượt xem"
          value="1.2k"
          trend="+15% từ tháng trước"
          icon={Eye}
          bgColor="bg-emerald-50"
          iconColor="bg-emerald-500"
        />
        <ColoredStatCard
          title="Bình luận"
          value="45"
          trend="+5 bình luận mới"
          icon={MessageSquare}
          bgColor="bg-sky-50"
          iconColor="bg-sky-500"
        />
        <ColoredStatCard
          title="Tỉ lệ chuyển đổi"
          value="2.4%"
          trend="+0.5% tăng trưởng"
          icon={TrendingUp}
          bgColor="bg-amber-50"
          iconColor="bg-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 border-gray-100 bg-white shadow-sm rounded-[8px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-black!">Thống kê tương tác</h3>
            <select className="text-xs font-bold bg-gray-50 border border-gray-100 rounded-[8px] px-3 py-2 outline-none">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#000000', fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#000000', fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#000000', fontWeight: 'bold' }}
                />
                <Bar dataKey="views" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="posts" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={30} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-8 border-gray-100 bg-white shadow-sm rounded-[8px] relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-black! mb-4 tracking-tight">Sáng tạo nội dung ngay 🚀</h3>
            <p className="text-gray-500 leading-relaxed font-medium mb-6">
              Bạn có ý tưởng mới? Hãy bắt đầu viết bài ngay để chia sẻ tri thức tới cộng đồng BitelleLearnHub.
            </p>
            <button className="w-full py-4 bg-primary text-white rounded-[8px] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-orange-500/20">
              Viết bài mới
            </button>
          </div>
          <LayoutDashboard className="absolute -right-8 -bottom-8 w-48 h-48 text-gray-50 opacity-10 rotate-12" />
        </Card>
      </div>
    </div>
  );
}

interface ColoredStatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
}

const ColoredStatCard = ({ title, value, trend, icon: Icon, bgColor, iconColor }: ColoredStatCardProps) => (
  <div className={`${bgColor} p-8 flex items-center gap-6 rounded-[8px] shadow-sm transition-transform hover:scale-[1.02] cursor-default border border-black/5`}>
    <div className={`${iconColor} w-14 h-14 rounded-[8px] flex items-center justify-center shadow-lg shadow-black/5 shrink-0`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-bold text-gray-500">{title}</p>
      <h4 className="text-2xl font-black text-black! leading-none">{value}</h4>
      <p className="text-[10px] font-black uppercase tracking-tighter text-black! opacity-70">{trend}</p>
    </div>
  </div>
);
