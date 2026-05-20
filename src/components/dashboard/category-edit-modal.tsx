'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Button, Input, Label } from '@/components/ui';
import { X, Check, Loader2 } from 'lucide-react';
import slugify from 'slugify';
import { useToast } from '@/components/ui/Toast';
import { Category } from '@/types/category';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onUpdate: () => void;
}

export default function CategoryEditModal({ isOpen, onClose, category, onUpdate }: CategoryEditModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    isHidden: !!category?.isHidden
  });
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: slugify(name, { lower: true, strict: true })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setLoading(true);

    try {
      await axios.put(`/api/admin/categories/${category.id}`, formData);
      toast('Cập nhật thông tin danh mục thành công');
      onUpdate();
      onClose();
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const msg = axiosError.response?.data?.error || 'Đã có lỗi xảy ra khi cập nhật.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-6 right-6">
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/10 rounded-[10px] border border-indigo-500/20">
              <Check className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Chỉnh sửa chi tiết</h2>
              <p className="text-slate-400 text-sm">Cập nhật toàn bộ thông tin định danh của danh mục.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="ml-1">Tên danh mục</Label>
                <Input 
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Tiêu đề danh mục mới"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="ml-1">Đường dẫn (Slug)</Label>
                <Input 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="duong-dan-danh-muc"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="ml-1">Mô tả danh mục</Label>
              <textarea 
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Viết mô tả chi tiết tại đây..."
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800 rounded-[10px]">
              <div>
                <p className="text-sm font-bold text-slate-200">Trạng thái công khai</p>
                <p className="text-xs text-slate-500">Ẩn danh mục này trên trang chủ Blog</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isHidden: !formData.isHidden})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isHidden ? 'bg-slate-700' : 'bg-indigo-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isHidden ? 'translate-x-1' : 'translate-x-6'}`} />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
              <Button type="submit" disabled={loading} className="px-8 flex gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

