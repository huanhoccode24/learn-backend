'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Input, Label } from '@/components/ui';
import { 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  X, 
  Loader2, 
  Settings2, 
  ShieldCheck, 
  Zap, 
  Crown 
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Feature {
  id: string;
  name: string;
  pro_enabled: boolean;
  vip_enabled: boolean;
}

export default function PackageManagementPage() {
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const res = await axios.get('/api/admin/features');
      setFeatures(res.data);
    } catch (err) {
      toast('Không thể tải danh sách tính năng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = async () => {
    if (!newFeatureName.trim()) return;
    try {
      const res = await axios.post('/api/admin/features', { name: newFeatureName });
      setFeatures([...features, res.data]);
      setNewFeatureName('');
      toast('Đã thêm tính năng mới');
    } catch (err) {
      toast('Lỗi khi thêm tính năng', 'error');
    }
  };

  const handleToggle = async (id: string, field: 'pro_enabled' | 'vip_enabled') => {
    const feature = features.find(f => f.id === id);
    if (!feature) return;

    const updatedFeature = { ...feature, [field]: !feature[field] };
    
    // Update local state immediately for snappy feel
    setFeatures(features.map(f => f.id === id ? updatedFeature : f));

    try {
      await axios.put('/api/admin/features', updatedFeature);
    } catch (err) {
      toast('Lỗi khi cập nhật trạng thái', 'error');
      // Rollback on error
      setFeatures(features);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tính năng này?')) return;
    try {
      await axios.delete(`/api/admin/features/${id}`);
      setFeatures(features.filter(f => f.id !== id));
      toast('Đã xóa tính năng');
    } catch (err) {
      toast('Lỗi khi xóa tính năng', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-[13px] font-normal text-gray-400">Đang tải ma trận tính năng...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-8 pb-20 animate-in fade-in duration-500 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Settings2 className="w-6 h-6 text-primary" />
            <h1 className="text-[26px] font-normal text-black! tracking-tight">Quản lý Gói Tài Nguyên</h1>
          </div>
          <p className="text-[13px] text-gray-400 mt-1 font-normal">Thiết lập ma trận quyền lợi cho các cấp bậc Cộng tác viên</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Matrix (Left) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-gray-200 bg-white rounded-[10px] overflow-hidden shadow-none!">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Tính năng / Quyền lợi</th>
                  <th className="px-6 py-5 text-center w-[150px]">
                    <div className="flex flex-col items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-[13px] font-black text-black">GÓI PRO</span>
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center w-[150px]">
                    <div className="flex flex-col items-center gap-1">
                      <Crown className="w-4 h-4 text-primary" />
                      <span className="text-[13px] font-black text-black">GÓI VIP</span>
                    </div>
                  </th>
                  <th className="px-8 py-5 text-right w-[100px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {features.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-[14px] font-medium text-black">{feature.name}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => handleToggle(feature.id, 'pro_enabled')}
                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-all ${feature.pro_enabled ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-gray-50 text-gray-300 border border-transparent'}`}
                      >
                        {feature.pro_enabled ? <Check className="w-5 h-5" strokeWidth={3} /> : <X className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => handleToggle(feature.id, 'vip_enabled')}
                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-all ${feature.vip_enabled ? 'bg-orange-50 text-primary border border-orange-100' : 'bg-gray-50 text-gray-300 border border-transparent'}`}
                      >
                        {feature.vip_enabled ? <Check className="w-5 h-5" strokeWidth={3} /> : <X className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(feature.id)}
                        className="p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {features.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-gray-400 text-[13px] italic">
                      Chưa có tính năng nào được thiết lập.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Add Feature Sidebar (Right) */}
        <div className="space-y-6">
          <Card className="border border-gray-200 bg-white rounded-[10px] p-6 shadow-none! space-y-6">
            <div>
              <h3 className="text-[14px] font-bold text-black flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-primary" />
                Thêm tính năng mới
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[12px] text-gray-400 font-normal">Tên tính năng</Label>
                  <Input 
                    placeholder="VD: Badge xác minh..." 
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    className="h-11 rounded-[10px] text-[13px] border-gray-100"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                  />
                </div>
                <Button 
                  onClick={handleAddFeature}
                  className="w-full bg-primary! text-white! h-11 rounded-[10px] text-[13px] font-bold shadow-sm shadow-orange-100"
                >
                  Tạo tính năng
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-[10px] border border-blue-100">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                  Cấp bậc quyền lợi sẽ được áp dụng trực tiếp cho các tài khoản Cộng tác viên dựa trên gói họ sở hữu.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
