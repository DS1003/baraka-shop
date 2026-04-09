'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgipqYgWA0JFh8lJiMdVc3N2eGlpF+X0E0VHyQk4h4YUk8WnyOj4V5ZE5BW3qKi4R7Z1NCXH2IiIJ4Z1REX3yGiIB3ZVNEYHuEh352YlRFYnqCg3xzXlVIZXqBgnlvWldKaHx/f3RoWFdNbH1+fG9iVldScH18emteV1hVdH16eGdYV1tYd3x4dl9UV15beHt2clhUYGBbeXp0bVVVY2N+e3NrUFdmZoB7cGdOWGlpiHtwZEpcbGyNeXBgRF1wcJJ4bFpBYXN0lnlqVj5jd3icemhQO2V7e6B6ZUo4aX1+ontjRTVqgICke2FBNW2Cg6d7XjwycYWFqnxcOC91h4esf1o1LXeKiK1/WDMseoyJrn9WMSt8jYmuf1UwK32Oiq5/VDArf46KrX9UMCt/j4qtf1QwK3+Piq1/VTArfo+KrX9VMCp+kIqtgFUwKn6Qiq2AVTAqfpCKrYBVMCp+kIqtgFU=';

interface UseRealtimeOrdersOptions {
  apiUrl?: string;
  enabled?: boolean;
  interval?: number;
  onNewOrder?: (order: any) => void;
}

export function useRealtimeOrders({
  apiUrl = '/api/admin/orders',
  enabled = true,
  interval = 10_000,
  onNewOrder,
}: UseRealtimeOrdersOptions) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onNewOrderRef = useRef(onNewOrder);

  // Keep onNewOrder ref in sync without causing re-renders
  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  }, [onNewOrder]);

  // Initialize audio once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      audioRef.current.volume = 0.5;
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      // Silently fail
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      // Use fetch with cache-busting to guarantee fresh data
      const res = await fetch(`${apiUrl}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: any[] = await res.json();
      const currentIds = new Set(data.map((o: any) => o.id));

      if (!isFirstLoadRef.current) {
        // Find new orders that weren't in the previous set
        const newOrders = data.filter(
          (o: any) => !previousOrderIdsRef.current.has(o.id)
        );

        if (newOrders.length > 0) {
          setNewOrderCount(prev => prev + newOrders.length);
          playNotificationSound();

          newOrders.forEach((order: any) => {
            const clientName = order.user?.username || order.user?.email || 'Client';
            const total = order.total?.toLocaleString() || '0';

            toast.success(
              `🛒 Nouvelle commande de ${clientName}`,
              {
                description: `Montant: ${total} F CFA • ${order.items?.length || 0} article(s)`,
                duration: 8000,
                action: {
                  label: 'Voir',
                  onClick: () => {
                    onNewOrderRef.current?.(order);
                  },
                },
              }
            );
          });
        }
      }

      previousOrderIdsRef.current = currentIds;
      isFirstLoadRef.current = false;
      setOrders(data);
      setIsLive(true);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Realtime polling error:', err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, playNotificationSound]);

  // Initial load + polling setup
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchOrders();

    // Setup polling
    intervalRef.current = setInterval(fetchOrders, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, fetchOrders]);

  const clearNewOrderCount = useCallback(() => {
    setNewOrderCount(0);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    setOrders,
    loading,
    isLive,
    newOrderCount,
    clearNewOrderCount,
    lastRefresh,
    refresh,
  };
}
