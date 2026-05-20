'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, Input, Button, Label } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { UploadCloud, Loader2, ArrowRight, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';

const bannerSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  code: z.string().min(1, 'Mã banner là bắt buộc'),
  link: z.string().url('Đường dẫn không hợp lệ').or(z.literal('')),
  order: z.string().refine((val) => parseInt(val, 10) >= 0, {
    message: 'Display order cannot be negative',
  }),
  is_active: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);
  const [existingOrders, setExistingOrders] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [bannerRes, allBannersRes] = await Promise.all([
          axios.get(`/api/admin/banners/${id}`),
          axios.get('/api/admin/banners?fields=metadata')
        ]);
        
        const data = bannerRes.data;
        reset({
          title: data.title,
          code: data.code || '',
          link: data.link || '',
          order: String(data.order),
          is_active: data.is_active,
        });
        setImageBase64(data.image);

        const orders = allBannersRes.data.map((b: any) => b.order).sort((a: number, b: number) => a - b);
        setExistingOrders(Array.from(new Set(orders)));
      } catch (err) {
        console.error('Error fetching data:', err);
        toast('Không thể tải dữ liệu banner.', 'error');
        router.push('/admin/banners');
      } finally {
        setIsLoadingBanner(false);
      }
    }
    fetchData();
  }, [id, reset, router, toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast('Kích thước ảnh phải nhỏ hơn 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: BannerFormValues) => {
    setIsSubmitting(true);
    try {
      await axios.put(`/api/admin/banners/${id}`, {
        ...data,
        order: parseInt(data.order, 10) || 0,
        image: imageBase64,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast('Banner đã được cập nhật thành công.');
      router.push('/admin/banners');
      router.refresh();
    } catch (error: unknown) {
      toast('Đã xảy ra lỗi khi cập nhật banner.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingBanner) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-black bg-white min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-[#E96E4A]! mb-4" strokeWidth={1.5} />
        <p className="text-sm font-normal tracking-wide">Đang tải dữ liệu banner...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 space-y-6 pb-20 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-normal text-black! tracking-tight">Edit Banner</h1>
          <p className="text-[13px] text-gray-400 mt-1 font-normal">Update and refine your banner details</p>
        </div>
        <Link href="/admin/banners">
          <Button className="bg-[#E96E4A]! hover:opacity-90 text-white! px-6 h-[42px] rounded-[10px] text-[13px] font-normal transition-all shadow-sm flex items-center gap-2">
            Go to Banner List
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Card className="border-gray-100 bg-white rounded-[10px] p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Banner Title */}
              <div className="space-y-2">
                <Label className="text-[13px] font-normal text-black! mb-2 block">Banner Title</Label>
                <Input
                  placeholder="Enter banner title"
                  {...register('title')}
                  className="bg-white border-gray-100 h-12 rounded-[10px] text-[14px] text-black focus:border-[#E96E4A] outline-none transition-all"
                />
                {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title.message}</p>}
              </div>

              {/* Banner Code */}
              <div className="space-y-2">
                <Label className="text-[13px] font-normal text-black! mb-2 block">Banner Code</Label>
                <Input
                  placeholder="e.g. BNR001"
                  {...register('code')}
                  className="bg-white border-gray-100 h-12 rounded-[10px] text-[14px] text-black focus:border-[#E96E4A] outline-none transition-all"
                />
                {errors.code && <p className="text-red-500 text-[11px] mt-1">{errors.code.message}</p>}
              </div>
            </div>

            {/* Target Link */}
            <div className="space-y-2">
              <Label className="text-[13px] font-normal text-black! mb-2 block">Target Link</Label>
              <Input
                placeholder="Enter URL (e.g. https://...)"
                {...register('link')}
                className="bg-white border-gray-100 h-12 rounded-[10px] text-[14px] text-black focus:border-[#E96E4A] outline-none transition-all"
              />
              {errors.link && <p className="text-red-500 text-[11px] mt-1">{errors.link.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Display Order with Picker */}
              <div className="space-y-2">
                <Label className="text-[13px] font-normal text-black! mb-2 block">Display Order</Label>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      const current = parseInt(watch('order') || '0', 10);
                      setValue('order', String(Math.max(0, current - 1)));
                    }}
                    className="w-12 h-12 flex items-center justify-center border border-gray-100 rounded-[10px] hover:bg-gray-50 text-black transition-all active:scale-95"
                    aria-label="Decrease display order"
                    title="Decrease display order"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <Input
                    type="number"
                    min="0"
                    {...register('order')}
                    className="w-24 text-center bg-white border-gray-100 h-12 rounded-[10px] text-[14px] text-black focus:border-[#E96E4A] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const current = parseInt(watch('order') || '0', 10);
                      setValue('order', String(current + 1));
                    }}
                    className="w-12 h-12 flex items-center justify-center border border-gray-100 rounded-[10px] hover:bg-gray-50 text-black transition-all active:scale-95"
                    aria-label="Increase display order"
                    title="Increase display order"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="ml-2 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-gray-400 font-normal">Used: {existingOrders.join(', ')}</span>
                    <span className="text-[11px] text-[#E96E4A] font-normal ml-2">
                      Suggest: {existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 0}
                    </span>
                  </div>
                </div>
                {errors.order && <p className="text-red-500 text-[11px] mt-1">{errors.order.message}</p>}
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <Label className="text-[13px] font-normal text-black! mb-2 block">Status</Label>
                <div className="flex gap-2 h-12 p-1 bg-gray-50 border border-gray-100 rounded-[12px]">
                  <button
                    type="button"
                    onClick={() => setValue('is_active', true)}
                    className={`flex-1 rounded-[10px] text-[13px] font-normal transition-all duration-200 ${
                      watch('is_active') 
                        ? 'bg-[#E96E4A] text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('is_active', false)}
                    className={`flex-1 rounded-[10px] text-[13px] font-normal transition-all duration-200 ${
                      !watch('is_active') 
                        ? 'bg-[#414141] text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Image Area */}
          <div className="space-y-2">
            <Label className="text-[13px] font-normal text-black! mb-2 block">Banner Image</Label>
            <div className={`relative rounded-[10px] transition-all overflow-hidden ${imageBase64 ? 'bg-white border border-gray-100' : 'border-2 border-dashed border-gray-100 bg-gray-50/30 p-8'}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className="flex flex-col items-center justify-center">
                {imageBase64 ? (
                  <div className="w-full relative h-[480px] bg-white">
                    <Image 
                      src={imageBase64} 
                      alt="Preview" 
                      fill
                      className="object-contain" 
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
                      <p className="text-white text-[13px] font-normal flex items-center gap-2 bg-black/60 px-6 py-2.5 rounded-full border border-white/20">
                        <UploadCloud className="w-5 h-5" /> Change Banner Image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <UploadCloud className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                    <p className="text-[14px] text-gray-400 font-normal">Click or drag image to upload</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-50">
            <Button 
              type="submit" 
              className="bg-[#E96E4A]! hover:opacity-90 text-white! px-8 h-[46px] rounded-[10px] text-[14px] font-normal shadow-sm flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href="/admin/banners">
              <Button 
                type="button"
                className="bg-[#414141]! hover:bg-[#313131]! text-white! px-8 h-[46px] rounded-[10px] text-[14px] font-normal"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
