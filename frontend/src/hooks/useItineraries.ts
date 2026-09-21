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

      const q = effectiveUserId ? `?userId=${encodeURIComponent(effectiveUserId)}` : '';
      const res = await fetch(`/api/itineraries${q}`);
      if (!res.ok) {
        throw new Error('無法取得行程列表');
      }

      const json = await res.json();
      setActiveItineraryId(json.activeItineraryId || null);
      setItineraries(json.data || []);

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
      const res = await fetch(`/api/itineraries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: true }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || '封存失敗');
      }
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
      const res = await fetch(`/api/itineraries/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || '刪除失敗');
      }
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