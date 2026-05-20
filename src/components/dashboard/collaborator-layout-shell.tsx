'use client';

import React, { useState } from 'react';
import { CollaboratorSidebar } from './collaborator-sidebar';
import { CollaboratorHeader } from './collaborator-header';

interface CollaboratorLayoutShellProps {
  children: React.ReactNode;
  user: any;
}

export function CollaboratorLayoutShell({ children, user }: CollaboratorLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-black font-sans">
      {/* Nền mờ (Overlay) trên Mobile/Tablet */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Tự động ẩn trên mobile, trượt từ bên trái ra khi click Menu */}
      <CollaboratorSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Vùng nội dung bên phải - Có khoảng cách lề trái trên Desktop, co giãn tự động trên Mobile */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-0 min-w-0 transition-all duration-300">
        <CollaboratorHeader user={user} onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 overflow-visible bg-white">
          <div className="space-y-6 animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
