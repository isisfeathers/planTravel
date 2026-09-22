import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
  const [itineraries, setItineraries] = useState<ItineraryEntity[]>([]);
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let effectiveUserId = userId;
      if (!effectiveUserId) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user?.id) {
            effectiveUserId = authData.user.id;
          }
        } catch (e) {}
      }

      let fetched = false;
      const isStaticHost =
        typeof window !== 'undefined' &&
        (window.location.hostname.includes('github.io') ||
          process.env.NEXT_PUBLIC_MOCK_LIFF === 'true');

      // 1. 若非靜態主機，先嘗試呼叫 API 端點
      if (!isStaticHost) {
        try {
          const q = effectiveUserId ? `?userId=${encodeURIComponent(effectiveUserId)}` : '';
          const res = await fetch(`/api/itineraries${q}`);
          if (res.ok) {
            const json = await res.json();
            setActiveItineraryId(json.activeItineraryId || null);
            setItineraries(json.data || []);
            fetched = true;
          }
        } catch (e) {
          // API 呼叫失敗，進入 Supabase 直接查詢備援
        }
      }

      // 2. 靜態託管 / GitHub Pages 環境備援：直接使用 Supabase Client 讀取
      if (!fetched) {
        if (effectiveUserId) {
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

          if (!uErr && userItins && userItins.length > 0) {
            setItineraries(userItins);
            fetched = true;
          }
        }

        if (!fetched) {
          const { data: allData } = await supabase
            .from('itineraries')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(30);

          setItineraries(allData || []);
        }
      }

    } catch (err: any) {
      setError(err.message || '資料讀取異常');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const setActiveItinerary = async (id: string): Promise<boolean> => {
    if (!userId) return false;
    const previousActiveId = activeItineraryId;
    setActiveItineraryId(id);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          active_itinerary_id: id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;
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
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
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

  const activeAndUpcoming = useMemo(() => {
    return itineraries.filter((item) => !item.is_archived);
  }, [itineraries]);

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