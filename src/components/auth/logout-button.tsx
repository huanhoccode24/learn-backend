'use client';

import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

type LogoutButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const LogoutButton = ({ className, ...props }: LogoutButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
        setIsPending(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors disabled:opacity-50 ${className}`}
      {...props}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      Đăng xuất
    </button>
  );
};
