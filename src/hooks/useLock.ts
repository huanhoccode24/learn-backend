'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

interface LockInfo {
  editingBy: string | null;
  editingByName: string | null;
  success: boolean;
}

export function useLock(entityType: 'banners' | 'posts', id: string) {
  const [isLockedByMe, setIsLockedByMe] = useState(false);
  const [lockInfo, setLockInfo] = useState<LockInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const isLockedByMeRef = useRef(false);

  // Đồng bộ ref với state
  useEffect(() => {
    isLockedByMeRef.current = isLockedByMe;
  }, [isLockedByMe]);

  const lock = useCallback(async () => {
    try {
      const { data } = await axios.post(`/api/admin/${entityType}/${id}/lock`);
      if (data.success) {
        console.log(`[useLock] Lock acquired successfully for ${id}`);
        setIsLockedByMe(true);
        setLockInfo({ success: true, editingBy: null, editingByName: null });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 423) {
          console.log(`[useLock] Lock denied for ${id}. Held by: ${error.response.data.editingByName}`);
          setIsLockedByMe(false);
          setLockInfo({
            success: false,
            editingBy: error.response.data.editingBy,
            editingByName: error.response.data.editingByName,
          });
        } else {
          console.error(`[useLock] Lock error ${error.response?.status}:`, error.response?.data);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [entityType, id]);

  const unlock = useCallback(async () => {
    try {
      await axios.delete(`/api/admin/${entityType}/${id}/lock`);
      setIsLockedByMe(false);
    } catch (error) {
      console.error('Failed to unlock:', error);
    }
  }, [entityType, id]);

  useEffect(() => {
    if (!id) return;

    console.log(`[useLock] Initializing lock for ${entityType}/${id}`);
    
    // Hàm khởi tạo lock
    const initLock = async () => {
      await lock();
    };

    initLock();

    // Heartbeat định kỳ mỗi 1 phút (nhanh hơn để đảm bảo giữ lock)
    heartbeatInterval.current = setInterval(() => {
      if (isLockedByMeRef.current) {
        lock();
      }
    }, 60 * 1000);

    // Giải phóng khi thoát trang
    const handleBeforeUnload = () => {
      if (isLockedByMeRef.current) {
        const url = `/api/admin/${entityType}/${id}/lock`;
        // Sử dụng navigator.sendBeacon để đảm bảo gửi request ngay cả khi đóng tab
        // Tuy nhiên API cần hỗ trợ GET/POST cho unlock nếu muốn dùng beacon, 
        // tạm thời vẫn dùng axios delete vì nó chạy trong cleanup
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      if (isLockedByMeRef.current) {
        console.log(`[useLock] Cleaning up lock for ${id}`);
        unlock();
      }
    };
  }, [id, lock, unlock, entityType]);

  return {
    isLockedByMe,
    lockInfo,
    isLoading,
    refreshLock: lock,
  };
}
