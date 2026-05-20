'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (messageOrOptions: string | ToastOptions, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Map type -> tiêu đề mặc định
const defaultTitles: Record<ToastType, string> = {
  success: 'Thành công',
  error: 'Lỗi',
  warning: 'Cảnh báo',
  info: 'Thông tin',
  loading: 'Đang xử lý',
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((messageOrOptions: string | ToastOptions, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);

    let toastData: Toast;

    if (typeof messageOrOptions === 'string') {
      // API cũ: toast('message', 'type')
      toastData = {
        id,
        title: defaultTitles[type],
        message: messageOrOptions,
        type,
      };
    } else {
      // API mới: toast({ title, message, type })
      const resolvedType = messageOrOptions.type || 'success';
      toastData = {
        id,
        title: messageOrOptions.title || defaultTitles[resolvedType],
        message: messageOrOptions.message,
        type: resolvedType,
      };
    }

    setToasts((prev) => {
      const newToasts = [...prev, toastData];
      if (newToasts.length > 5) {
        return newToasts.slice(newToasts.length - 5);
      }
      return newToasts;
    });

    // Tự động xóa sau 4 giây
    if (toastData.type !== 'loading') {
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Cấu hình style theo type
const toastConfig: Record<ToastType, {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  progressColor: string;
}> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    progressColor: 'bg-emerald-500',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    borderColor: 'border-rose-500/30',
    progressColor: 'bg-rose-500',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    borderColor: 'border-amber-500/30',
    progressColor: 'bg-amber-500',
  },
  info: {
    icon: <Info className="w-5 h-5 text-indigo-400" />,
    iconBg: 'bg-indigo-500/10 border-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    progressColor: 'bg-indigo-500',
  },
  loading: {
    icon: <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />,
    iconBg: 'bg-slate-800 border-slate-700',
    borderColor: 'border-slate-700',
    progressColor: 'bg-indigo-500',
  },
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: () => void }) => {
  const config = toastConfig[toast.type];

  return (
    <div className={`
      pointer-events-auto
      flex items-start gap-3.5 p-4 pr-11
      min-w-[340px] max-w-md
      bg-slate-950/95 backdrop-blur-xl
      border ${config.borderColor}
      rounded-xl shadow-2xl shadow-black/40
      animate-in slide-in-from-right-full fade-in duration-400
      relative overflow-hidden
    `}>
      {/* Icon trong khung vuông */}
      <div className={`
        shrink-0 w-10 h-10 rounded-lg border
        flex items-center justify-center
        ${config.iconBg}
      `}>
        {config.icon}
      </div>

      {/* Nội dung: Title + Message */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-bold text-white leading-tight">{toast.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{toast.message}</p>
      </div>

      {/* Nút đóng */}
      <button
        onClick={onRemove}
        className="absolute right-3 top-3.5 p-1 text-slate-600 hover:text-slate-300 transition-colors rounded-md hover:bg-slate-800/50"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      {toast.type !== 'loading' && (
        <div className="absolute bottom-0 left-0 h-[3px] w-full overflow-hidden bg-slate-800/50">
          <div className={`h-full ${config.progressColor} animate-toast-progress origin-left`} />
        </div>
      )}
    </div>
  );
};
