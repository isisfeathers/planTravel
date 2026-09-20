const fs = require('fs');

const useItinerariesPath = 'frontend/src/hooks/useItineraries.ts';
let useItinerariesContent = fs.readFileSync(useItinerariesPath, 'utf8');

const useItinerariesReplacement = `
export function useItineraries(userId: string | undefined): UseItinerariesReturn {
  const [itineraries, setItineraries] = useState<ItineraryEntity[]>([]);
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // ================= MOCK IMPLEMENTATION ==================
    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
      console.log("[Mock] Fetching Dashboard Data for:", userId);
      setIsLoading(false);
      return; 
    }
    // ========================================================

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setItineraries(data || []);

    } catch (err: any) {
      setError("讀取行程時發生錯誤: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
`;

useItinerariesContent = useItinerariesContent.replace(/export function useItineraries\\(userId: string \\| undefined\\): UseItinerariesReturn \\{[\\s\\S]*?useEffect\(\\(\\) => \{\s*fetchData\(\);\s*\}, \[fetchData\]\);/, useItinerariesReplacement);
fs.writeFileSync(useItinerariesPath, useItinerariesContent, 'utf8');
console.log('3. useItineraries Hook (Mock mode) 重構完成');

