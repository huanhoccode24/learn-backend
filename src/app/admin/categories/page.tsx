'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Category } from '@/types';
import { Button, Input, Label } from '@/components/ui';
import { 
  Plus, 
  Trash2, 
  Folder, 
  Eye, 
  EyeOff, 
  Loader2, 
  Settings2, 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import CategoryEditModal from '@/components/dashboard/category-edit-modal';
import { useToast } from '@/components/ui/Toast';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // State cho Modal Chỉnh sửa chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories');
      setCategories(res.data);
    } catch (err) {
      toast('Không thể tải danh sách danh mục. Vui lòng thử lại.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/categories', newCat);
      setNewCat({ name: '', description: '' });
      setIsAdding(false);
      toast('Danh mục mới đã được thêm thành công.');
      fetchCategories();
    } catch (err) {
      toast('Đã xảy ra lỗi khi thêm danh mục. Vui lòng thử lại.', 'error');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      toast('Danh mục đã được xóa thành công.');
      fetchCategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Lỗi khi xóa danh mục';
      toast(errorMsg, 'error');
    }
  };

  const toggleHide = async (id: string, currentHidden: boolean) => {
    try {
      await axios.put(`/api/admin/categories/${id}`, { isHidden: !currentHidden });
      toast(`Đã cập nhật trạng thái hiển thị thành công.`);
      fetchCategories();
    } catch (err) {
      toast('Lỗi khi thay đổi trạng thái ẩn/hiện.', 'error');
    }
  };

  const openDetailedEdit = (cat: Category) => {
    setSelectedCat(cat);
    setIsModalOpen(true);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-black bg-white min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#E96E4A]! mb-4" strokeWidth={1.5} />
        <p className="text-sm font-normal tracking-wide">Đang tải danh mục...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans antialiased px-4 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[24px] font-normal text-black! tracking-tight">Categories</h1>
          <p className="text-[13px] text-gray-400 mt-1 font-normal">Organize and manage your blog topics</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-[#E96E4A]! hover:opacity-90 text-white! px-6 h-[42px] rounded-[10px] text-[13px] font-normal transition-all shadow-sm"
        >
          + Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <ColoredStatCard
          title="Total Categories"
          value={categories.length.toLocaleString()}
          icon={Folder}
          iconColor="bg-[#E96E4A]"
        />
        <ColoredStatCard
          title="Visible"
          value={categories.filter(c => !c.isHidden).length.toLocaleString()}
          icon={CheckCircle2}
          iconColor="bg-[#E96E4A]"
        />
        <ColoredStatCard
          title="Hidden"
          value={categories.filter(c => c.isHidden).length.toLocaleString()}
          icon={EyeOff}
          iconColor="bg-[#E96E4A]"
        />
      </div>

      {/* Toolbar & View Toggle */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-[10px]">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-normal transition-all ${
              viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Card View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-normal transition-all ${
              viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'
            }`}
          >
            <List className="w-4 h-4" /> List View
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search categories..." 
              className="bg-white border-[#E96E4A]! h-[42px] pl-10 rounded-[10px] text-[14px] text-black font-normal placeholder:text-gray-300 focus:border-[#E96E4A] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-[42px] px-4 rounded-[10px] border-[#E96E4A]! text-black font-normal text-[12px] gap-2 hover:bg-orange-50 transition-all shrink-0">
            <Filter className="w-4 h-4 text-[#E96E4A]" strokeWidth={1.5} /> Filter
          </Button>
          <Button variant="outline" className="h-[42px] px-4 rounded-[10px] border-[#E96E4A]! text-black font-normal text-[12px] gap-2 hover:bg-orange-50 transition-all shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-[#E96E4A]" strokeWidth={1.5} /> Excel
          </Button>
        </div>
      </div>

      {/* Adding Section (Modern Modal Style) */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white border border-gray-100 rounded-[20px] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-normal text-black!">Create New Category</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-black transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[13px] font-normal text-gray-500">Category Name</Label>
                <Input
                  className="bg-gray-50 border-gray-100 h-12 rounded-[10px] focus:border-[#E96E4A] transition-all text-[14px] px-4 text-black"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Technology, Health..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-normal text-gray-500">Description</Label>
                <textarea
                  className="w-full bg-gray-50 border border-gray-100 h-24 rounded-[10px] focus:border-[#E96E4A] transition-all text-[14px] p-4 text-black outline-none"
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="What is this category about?"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12 rounded-[10px] border-gray-100 text-gray-500 font-normal"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 rounded-[10px] bg-[#E96E4A]! text-white! font-normal"
                >
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.length === 0 ? (
            <EmptyState />
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id} className={`bg-white border border-gray-100 rounded-[10px] p-6 transition-all hover:border-[#E96E4A] group relative overflow-hidden flex flex-col h-[200px] ${cat.isHidden ? 'bg-gray-50/50 grayscale' : ''}`}>
                {/* Left Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${cat.isHidden ? 'bg-gray-300' : 'bg-[#E96E4A]'}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.isHidden ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 text-[#E96E4A]'}`}>
                      <Folder className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[16px] font-normal text-black! truncate pr-2">{cat.name}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openDetailedEdit(cat)} className="p-2 hover:bg-orange-50 rounded-lg text-gray-400 hover:text-[#E96E4A] transition-all">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleHide(cat.id, !!cat.isHidden)} className="p-2 hover:bg-orange-50 rounded-lg text-gray-400 hover:text-[#E96E4A] transition-all">
                      {cat.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-[13px] text-gray-400 font-normal line-clamp-3 flex-1 mb-4 leading-relaxed">
                  {cat.description || 'No description available for this category.'}
                </p>
                
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className={`text-[11px] font-normal uppercase tracking-wider ${cat.isHidden ? 'text-gray-400' : 'text-[#E96E4A]'}`}>
                    {cat.isHidden ? 'Hidden' : 'Visible'}
                  </span>
                  <button onClick={() => openDetailedEdit(cat)} className="text-[12px] text-gray-400 hover:text-black font-normal transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List View (Table Style) */
        <div className="border border-gray-100 rounded-[10px] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E96E4A] text-white border-b border-[#E96E4A]">
                  <th className="px-6 py-4 text-[14px] font-normal capitalize">Category Name</th>
                  <th className="px-6 py-4 text-[14px] font-normal capitalize">Description</th>
                  <th className="px-6 py-4 text-[14px] font-normal capitalize">Status</th>
                  <th className="px-6 py-4 text-[14px] font-normal capitalize text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Folder className={`w-4 h-4 ${cat.isHidden ? 'text-gray-300' : 'text-[#E96E4A]'}`} />
                          <span className="text-[14px] text-black font-normal">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] text-gray-400 font-normal truncate max-w-[400px]">
                          {cat.description || 'No description'}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[13px] font-normal ${cat.isHidden ? 'text-gray-400' : 'text-emerald-500'}`}>
                          {cat.isHidden ? 'Hidden' : 'Visible'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right flex justify-end gap-4">
                        <button onClick={() => openDetailedEdit(cat)} className="text-[14px] text-gray-400 hover:text-black font-normal transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="text-[14px] text-gray-400 hover:text-red-500 font-normal transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-normal">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CategoryEditModal
        key={selectedCat?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCat}
        onUpdate={fetchCategories}
      />
    </div>
  );
}

const EmptyState = () => (
  <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-[20px]">
    <Folder className="w-16 h-16 mb-4 opacity-10 text-black" />
    <p className="font-normal text-[16px] text-black">No categories found.</p>
    <p className="text-[13px] mt-1">Try adjusting your search or add a new category.</p>
  </div>
);

interface ColoredStatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
}

const ColoredStatCard = ({ title, value, icon: Icon, iconColor }: ColoredStatCardProps) => (
  <div className="bg-white p-6 flex items-center gap-5 rounded-[10px] transition-all hover:translate-x-1 cursor-default border border-gray-100 relative overflow-hidden group">
    {/* Colored bar on the left */}
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${iconColor}`} />
    
    <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 ml-1">
      <Icon className="w-6 h-6 text-[#E96E4A]!" strokeWidth={1.5} />
    </div>
    <div className="space-y-0.5">
      <p className="text-[12px] font-normal text-gray-400">{title}</p>
      <h4 className="text-[26px] font-medium text-black! leading-none">{value}</h4>
    </div>
  </div>
);
