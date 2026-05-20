'use client';

import React, { useState } from 'react';
import TipTapEditor from '@/components/editor/TipTapEditor';

export default function TestEditorPage() {
  const [content, setContent] = useState('<p>Chào mừng bạn đến với phòng test realtime!</p>');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Phòng Test Realtime</h1>
          <p className="text-slate-400 mt-2">
            Mở đường link này trên 2 trình duyệt (hoặc 2 máy tính) khác nhau để test tính năng gõ chung nhé. 
            Phòng này là Public nên không cần đăng nhập!
          </p>
        </div>

        {/* Truyền một roomId cố định để 2 người vào cùng 1 phòng */}
        <TipTapEditor 
          value={content} 
          onChange={setContent} 
          roomId="public-test-room-123" 
        />
      </div>
    </div>
  );
}
