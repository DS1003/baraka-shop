'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3'; // Placez votre son premium ici (ex: son type Shopify/Stripe)

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
            const itemsCount = order.items?.length || 0;
            const orderRef = `#ORD-${order.id.substring(0, 8).toUpperCase()}`;

            toast.custom((t) => (
              <div 
                className="flex items-start gap-4 p-4 bg-white border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl w-[380px] cursor-pointer hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 group"
                onClick={() => {
                  onNewOrderRef.current?.(order);
                  toast.dismiss(t);
                }}
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <div className="flex-1 flex flex-col pt-0.5">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-900 text-[15px]">Nouvelle commande</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">À l'instant</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-snug">
                    <span className="font-semibold text-slate-900">{clientName}</span> a commandé pour <span className="font-bold text-orange-600">{total} FCFA</span>
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-[11px] font-bold tracking-wide border border-slate-100">
                      {orderRef}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-[11px] font-bold tracking-wide border border-slate-100">
                      {itemsCount} article{itemsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ), { 
              duration: 8000,
              id: order.id // Prevent duplicates
            });
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
