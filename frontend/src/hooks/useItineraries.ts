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

      let activeId = null;
      let userItineraries: ItineraryEntity[] = [];

      if (effectiveUserId) {
        try {
          const { data: pData } = await supabase
            .from('profiles')
            .select('active_itinerary_id')
            .eq('id', effectiveUserId)
            .maybeSingle();
          if (pData) activeId = pData.active_itinerary_id;
        } catch (e) {
          console.warn('Profiles 讀取跳過:', e);
        }

        try {
          const { data: iData, error: iErr } = await supabase
            .from('itineraries')
            .select('*')
            .eq('user_id', effectiveUserId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

          if (!iErr && iData && iData.length > 0) {
            userItineraries = iData;
          }
        } catch (e) {
          console.warn('Itineraries 依 userId 讀取跳過:', e);
        }
      }

      // 如果依特定 userId 沒找到或尚未登入，讀取資料庫最近未刪除的行程
      if (userItineraries.length === 0) {
        try {
          const { data: allData, error: allErr } = await supabase
            .from('itineraries')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(30);

          if (!allErr && allData) {
            userItineraries = allData;
          }
        } catch (e) {
          console.warn('Fallback 行程讀取跳過:', e);
        }
      }

      setActiveItineraryId(activeId);
      setItineraries(userItineraries);

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
      const { error: updateError } = await supabase
        .from('itineraries')
        .update({
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;
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
      const { error: deleteError } = await supabase
        .from('itineraries')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (deleteError) throw deleteError;
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