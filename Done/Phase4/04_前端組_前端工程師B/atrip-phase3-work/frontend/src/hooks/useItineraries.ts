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
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [profileRes, itinerariesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('active_itinerary_id')
          .eq('id', userId)
          .single(),
        supabase
          .from('itineraries')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
      ]);

      if (profileRes.error) {
        throw new Error(`Profile 查詢失敗: ${profileRes.error.message}`);
      }
      if (itinerariesRes.error) {
        throw new Error(`行程列表查詢失敗: ${itinerariesRes.error.message}`);
      }

      setActiveItineraryId(profileRes.data?.active_itinerary_id ?? null);
      const validItineraries = (itinerariesRes.data as ItineraryEntity[]).filter(
        (item) => item.deleted_at === null
      );
      setItineraries(validItineraries);
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