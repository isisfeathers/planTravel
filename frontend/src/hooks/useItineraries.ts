import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/useAuthStore';
import { ItineraryEntity } from '@/types/itinerary';

export interface UseItinerariesReturn {
  itineraries: ItineraryEntity[];
  activeItineraryId: string | null;
  activeAndUpcoming: ItineraryEntity[];
  archived: ItineraryEntity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setActiveItinerary: (id: string) => Promise<boolean>;
  archiveItinerary: (id: string) => Promise<boolean>;
  softDeleteItinerary: (id: string) => Promise<boolean>;
}

export function useItineraries(userId: string | undefined): UseItinerariesReturn {
  const { user } = useAuthStore();
  const effectiveUserId = userId || user?.id;
  const lineUserId = user?.line_user_id;

  const [itineraries, setItineraries] = useState<ItineraryEntity[]>([]);
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!effectiveUserId && !lineUserId) {
      setItineraries([]);
      setActiveItineraryId(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. 優先嘗試呼叫高相容原子化 get_user_dashboard RPC (不懼 RLS 隔離)
      let rpcSucceeded = false;
      try {
        const { data: dashData, error: dashErr } = await supabase.rpc('get_user_dashboard', {
          p_user_id: effectiveUserId || null,
          p_line_user_id: lineUserId || null,
        });

        if (!dashErr && dashData) {
          rpcSucceeded = true;
          if (dashData.active_itinerary_id) {
            setActiveItineraryId(dashData.active_itinerary_id);
          }
          if (Array.isArray(dashData.itineraries)) {
            setItineraries(dashData.itineraries);
          }
        }
      } catch (rpcEx) {
        console.warn('[useItineraries] RPC 讀取提示, 切換至直接查詢:', rpcEx);
      }

      // 2. 若 RPC 未命中或環境尚未部署該 RPC，使用標準 PostgREST 備援讀取
      if (!rpcSucceeded && effectiveUserId) {
        try {
          const { data: pData } = await supabase
            .from('profiles')
            .select('active_itinerary_id')
            .eq('id', effectiveUserId)
            .maybeSingle();
          if (pData?.active_itinerary_id) {
            setActiveItineraryId(pData.active_itinerary_id);
          }
        } catch (e) {}

        const { data: userItins, error: uErr } = await supabase
          .from('itineraries')
          .select('*')
          .eq('user_id', effectiveUserId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (uErr) {
          throw uErr;
        }

        setItineraries(userItins || []);
      }
    } catch (err: any) {
      setError(err.message || '資料讀取異常');
      setItineraries([]);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserId, lineUserId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const setActiveItinerary = async (id: string): Promise<boolean> => {
    const targetUserId = effectiveUserId;
    if (!targetUserId) return false;
    const previousActiveId = activeItineraryId;
    setActiveItineraryId(id);

    try {
      // 1. 優先透過 RPC 設定
      const { error: rpcErr } = await supabase.rpc('set_active_itinerary', {
        p_user_id: targetUserId,
        p_itinerary_id: id,
      });

      if (rpcErr) {
        // 2. 備援直接更新表
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            active_itinerary_id: id,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId);

        if (updateError) throw updateError;
      }
      return true;
    } catch (err: any) {
      setActiveItineraryId(previousActiveId);
      setError(`更新關注行程失敗: ${err.message}`);
      return false;
    }
  };

  const archiveItinerary = async (id: string): Promise<boolean> => {
    const previousList = [...itineraries];
    setItineraries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_archived: true } : item))
    );

    try {
      const { error: updateErr } = await supabase
        .from('itineraries')
        .update({
          is_archived: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateErr) throw updateErr;
      return true;
    } catch (err: any) {
      setItineraries(previousList);
      setError(`封存行程失敗: ${err.message}`);
      return false;
    }
  };

  const softDeleteItinerary = async (id: string): Promise<boolean> => {
    const previousList = [...itineraries];
    const previousActiveId = activeItineraryId;

    setItineraries((prev) => prev.filter((item) => item.id !== id));
    if (activeItineraryId === id) {
      setActiveItineraryId(null);
    }

    try {
      const { error: deleteErr } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;
      return true;
    } catch (err: any) {
      setItineraries(previousList);
      setActiveItineraryId(previousActiveId);
      setError(`刪除行程失敗: ${err.message}`);
      return false;
    }
  };

  // 釘選「當前關注」之行程自動置頂排序
  const activeAndUpcoming = useMemo(() => {
    const list = itineraries.filter((item) => !item.is_archived);
    if (!activeItineraryId) return list;
    return [...list].sort((a, b) => {
      if (a.id === activeItineraryId) return -1;
      if (b.id === activeItineraryId) return 1;
      return 0;
    });
  }, [itineraries, activeItineraryId]);

  const archived = useMemo(() => {
    return itineraries.filter((item) => item.is_archived);
  }, [itineraries]);

  return {
    itineraries,
    activeItineraryId,
    activeAndUpcoming,
    archived,
    isLoading,
    error,
    refetch: fetchDashboardData,
    setActiveItinerary,
    archiveItinerary,
    softDeleteItinerary
  };
}