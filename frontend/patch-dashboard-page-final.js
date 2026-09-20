const fs = require('fs');

const dashboardPath = 'frontend/src/app/dashboard/page.tsx';
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const dashboardReplacement = `
export default function DashboardPage() {
  const { user } = useAuthStore();
  const { 
    activeItineraryId,
    activeAndUpcoming, 
    archived, 
    isLoading: isItineraryLoading, 
    error: itineraryError,
    setActiveItinerary,
    archiveItinerary,
    softDeleteItinerary
  } = useItineraries(user?.id);

  if (isItineraryLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 sm:p-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">讀取行程資料中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col gap-8">
      <DashboardHeader />

      {itineraryError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {itineraryError}
        </div>
      )}
`;

dashboardContent = dashboardContent.replace(/export default function DashboardPage\(\) \{[\s\S]*?\{itineraryError && \(/, dashboardReplacement);
// Remove duplicated declaration if it exists
dashboardContent = dashboardContent.replace("const { activeItineraryId, activeAndUpcoming, archived, isLoading, error, setActiveItinerary, archiveItinerary, softDeleteItinerary } = useItineraries(user.id);", "");

fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
console.log('4. Dashboard 頁面重構完成');

