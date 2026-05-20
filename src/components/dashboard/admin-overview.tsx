'use client';

import React from 'react';
import {
  FileText,
  Tags,
  Users as UsersIcon,
  TrendingUp,
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Stats {
  postsCount: number;
  categoriesCount: number;
  usersCount: number;
}

const data = [
  { name: 'Jan', sales: 40, purchase: 24 },
  { name: 'Feb', sales: 30, purchase: 13 },
  { name: 'Mar', sales: 20, purchase: 98 },
  { name: 'Apr', sales: 27, purchase: 39 },
  { name: 'May', sales: 18, purchase: 48 },
  { name: 'Jun', sales: 23, purchase: 38 },
  { name: 'Jul', sales: 34, purchase: 43 },
];

const pieData = [
  { name: 'First Time', value: 5500 },
  { name: 'Return', value: 3500 },
];

export const AdminOverview = ({ stats }: { stats: Stats }) => {
  return (
    <div className="space-y-10 duration-700">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-black! tracking-tight">Dashboard</h1>
        <p className="text-gray-500 font-medium">Your main content goes here...</p>
      </div>

      {/* Colored Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ColoredStatCard
          title="Tổng bài viết"
          value={stats.postsCount.toLocaleString()}
          trend="+5% từ tháng trước"
          icon={FileText}
          bgColor="bg-rose-50"
          iconColor="bg-rose-500"
        />
        <ColoredStatCard
          title="Tổng người dùng"
          value={stats.usersCount.toLocaleString()}
          trend="+22% từ tháng trước"
          icon={UsersIcon}
          bgColor="bg-emerald-50"
          iconColor="bg-emerald-500"
        />
        <ColoredStatCard
          title="Tổng danh mục"
          value={stats.categoriesCount.toLocaleString()}
          trend="+10% từ tháng trước"
          icon={Tags}
          bgColor="bg-sky-50"
          iconColor="bg-sky-500"
        />
        <ColoredStatCard
          title="Lượt xem mới"
          value="1,250"
          trend="+35% từ tháng trước"
          icon={TrendingUp}
          bgColor="bg-amber-50"
          iconColor="bg-amber-500"
        />
      </div>


      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Purchase Bar Chart */}
        <Card className="lg:col-span-2 p-8 border-gray-100 bg-white shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-black">Sales vs Purchase</h3>
            <select className="text-xs font-bold bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#000000', fontWeight: 'bold' }}
                />
                <Bar dataKey="sales" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="purchase" fill="#fb7185" radius={[6, 6, 0, 0]} barSize={30} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Overall Information Circular Chart */}
        <Card className="p-8 border-gray-100 bg-white shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-black">Overall Information</h3>
            <select className="text-xs font-bold bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none">
              <option>Last 8 Months</option>
            </select>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="text-sm font-black text-black opacity-80 uppercase tracking-widest mb-6 w-full">Customers Overview</h4>
            <div className="h-[220px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#F59E0B'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-black">9.0K</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full mt-10">
              <div className="space-y-1">
                <p className="text-2xl font-black text-black leading-none">5.5K</p>
                <p className="text-xs font-bold text-gray-600 mb-2">First Time</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black">
                  <TrendingUp className="w-3 h-3" /> 25%
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-black leading-none">3.5K</p>
                <p className="text-xs font-bold text-gray-600 mb-2">Return</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black">
                  <TrendingUp className="w-3 h-3" /> 21%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

interface ColoredStatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
}

const ColoredStatCard = ({ title, value, trend, icon: Icon, bgColor, iconColor }: ColoredStatCardProps) => (
  <div className={`${bgColor} p-8 flex items-center gap-6 rounded-2xl shadow-sm transition-transform hover:scale-[1.02] cursor-default border border-black/5`}>
    <div className={`${iconColor} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 shrink-0`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-bold text-gray-500">{title}</p>
      <h4 className="text-2xl font-black text-black! leading-none">{value}</h4>
      <p className="text-[10px] font-black uppercase tracking-tighter text-black! opacity-70">{trend}</p>
    </div>
  </div>
);


