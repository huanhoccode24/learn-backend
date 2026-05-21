'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { UserProfile } from '@/types';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  User as UserIcon,
  Loader2,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States cho loading / saving
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Profile core state (real data from database)
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    bio: '',
    image: '',
    email: '',
    phoneNumber: '',
    address: '',
    facebookLink: '',
    tiktokLink: '',
    youtubeLink: '',
    accounts: [],
    role: 'USER',
    createdAt: new Date().toISOString(),
  });

  // Password fields
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    otp: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get('/api/profile');
        setProfile(prev => ({
          ...prev,
          ...res.data,
          name: res.data.name || '',
          bio: res.data.bio || '',
          phoneNumber: res.data.phoneNumber || '',
          address: res.data.address || '',
          facebookLink: res.data.facebookLink || '',
          tiktokLink: res.data.tiktokLink || '',
          youtubeLink: res.data.youtubeLink || '',
        }));
      } catch (err) {
        toast('Failed to load profile data', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [toast]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch('/api/profile', {
        name: profile.name,
        bio: profile.bio || null,
        image: profile.image || null,
        phoneNumber: profile.phoneNumber || null,
        address: profile.address || null,
        facebookLink: profile.facebookLink || null,
        tiktokLink: profile.tiktokLink || null,
        youtubeLink: profile.youtubeLink || null,
      });
      await update({ name: profile.name, image: profile.image });
      toast('Profile updated successfully!');
    } catch (err) {
      toast('Error saving profile changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast('Please select an image file', 'error');
    }

    if (file.size > 2 * 1024 * 1024) {
      return toast('Image size limit is 2MB', 'error');
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setProfile((prev) => ({ ...prev, image: base64 }));

      try {
        setSaving(true);
        await axios.patch('/api/profile', { image: base64 });
        await update({ image: base64 });
        toast('Profile picture updated successfully!');
      } catch (err) {
        toast('Failed to upload image', 'error');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setProfile(prev => ({ ...prev, image: '' }));
    try {
      setSaving(true);
      await axios.patch('/api/profile', { image: '' });
      await update({ image: '' });
      toast('Profile photo removed');
    } catch (err) {
      toast('Failed to remove photo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await axios.post('/api/profile/password/send-otp');
      toast('OTP code sent to your email', 'info');
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error : 'Error sending OTP';
      toast(errorMsg, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      return toast('Please enter a new password', 'error');
    }
    if (!passwordData.otp) {
      return toast('Please enter the OTP sent to your Email', 'error');
    }

    setVerifyingPassword(true);
    try {
      await axios.patch('/api/profile/password', {
        newPassword: passwordData.newPassword,
        otp: passwordData.otp
      });
      toast('Password changed successfully!');
      setPasswordData({ newPassword: '', otp: '' });
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error : 'Error changing password';
      toast(errorMsg, 'error');
    } finally {
      setVerifyingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-500 bg-white">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-400" />
        <p className="text-xs font-semibold">Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white py-10 px-6 md:px-12 font-sans antialiased text-[#2d3748] selection:bg-orange-500/20">
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 w-full">
        
        {/* ==================== LEFT COLUMN: Account Management & Security ==================== */}
        <div className="md:col-span-4 space-y-8 md:border-r md:border-gray-200/80 md:pr-10">
          
          {/* Account Management section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Account Management</h2>
            
            {/* Photo Box */}
            <div className="w-full aspect-4/3 rounded-[8px] bg-[#f4e6e1] relative flex items-center justify-center overflow-hidden border border-gray-100 transition-all hover:border-primary/30">
              {profile.image ? (
                <Image 
                  src={profile.image} 
                  alt="User Profile" 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center justify-center">
                  <UserIcon className="w-12 h-12" />
                  <span className="text-[10px] text-slate-400 mt-1 font-semibold">No Photo</span>
                </div>
              )}
              
              {profile.image && (
                <button 
                  type="button" 
                  onClick={handleRemovePhoto} 
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all cursor-pointer border-none outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Upload button */}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[6px] text-xs font-semibold text-gray-700 hover:bg-orange-50/30 hover:border-primary hover:text-primary transition-all text-center cursor-pointer shadow-none"
              >
                Upload Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Password security section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            


            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                placeholder="*********"
              />
            </div>

            {/* OTP Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">OTP Code</label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="text-[10px] text-primary hover:text-[#d15d3b] font-semibold underline cursor-pointer bg-transparent border-none p-0 outline-none transition-colors"
                >
                  {sendingOtp ? 'Sending...' : 'Get OTP'}
                </button>
              </div>
              <input
                type="text"
                value={passwordData.otp}
                onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all text-center tracking-widest font-semibold"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {/* Change Password Button */}
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={verifyingPassword}
              className="w-full py-2.5 px-4 bg-primary text-white hover:bg-[#d15d3b] hover:shadow-lg hover:shadow-orange-500/10 rounded-[6px] text-xs font-semibold transition-all text-center cursor-pointer shadow-none flex items-center justify-center gap-2 border-none"
            >
              {verifyingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
              Change Password
            </button>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: Profile Information & Contact Details ==================== */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Profile Information Subtitle */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-6">Profile Information</h2>
          </div>

          {/* Profile info inputs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Role</label>
              <div className="relative">
                <select
                  disabled
                  value={profile.role}
                  onChange={() => {}}
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-500 focus:outline-none transition-all appearance-none cursor-not-allowed"
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="COLLABORATOR">Collaborator</option>
                  <option value="USER">Subscriber</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-slate-400 pointer-events-none gap-0.5">
                  <ChevronUp className="w-2.5 h-2.5" />
                  <ChevronDown className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

          </div>

          {/* Contact Info Section */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Contact Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Email (required)</label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full h-10 px-3 bg-slate-50/50 border border-gray-200 rounded-[6px] text-xs text-slate-400 cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Phone Number</label>
                <input
                  type="text"
                  value={profile.phoneNumber || ''}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  placeholder="VD: 0912345678"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Address</label>
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  placeholder="VD: 123 Đường ABC, Quận XYZ, Hà Nội"
                />
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Social Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Facebook URL</label>
                <input
                  type="text"
                  value={profile.facebookLink || ''}
                  onChange={(e) => setProfile({ ...profile, facebookLink: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">TikTok URL</label>
                <input
                  type="text"
                  value={profile.tiktokLink || ''}
                  onChange={(e) => setProfile({ ...profile, tiktokLink: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  placeholder="https://tiktok.com/@yourprofile"
                />
              </div>

              {/* YouTube */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">YouTube Channel URL</label>
                <input
                  type="text"
                  value={profile.youtubeLink || ''}
                  onChange={(e) => setProfile({ ...profile, youtubeLink: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
            </div>
          </div>

          {/* About the User Section */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">About the User</h3>
            
            {/* Biographical Info */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">Biographical Info</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Share a short bio about yourself..."
                className="w-full min-h-[120px] p-3.5 bg-white border border-gray-200 rounded-[6px] text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all placeholder:text-gray-300 resize-y"
              />
            </div>
          </div>

          {/* Save Profile Button */}
          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 bg-primary text-white hover:bg-[#d15d3b] hover:shadow-lg hover:shadow-orange-500/10 rounded-[6px] text-xs font-semibold transition-all cursor-pointer shadow-none flex items-center gap-2 border-none"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
              Save Profile
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
