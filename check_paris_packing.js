const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://fvnxaksfcftatvxddhpx.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bnhha3NmY2Z0YXR2eGRkaHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTUzMjk5OCwiZXhwIjoyMTA1MTA4OTk4fQ.a2n_6uHAugC5IeddlGG3wIHoZn4l5Z_lskV-IUrRzQk");

async function check() {
  const { data } = await supabase.from("itineraries").select("id, destination, title, status, itinerary_data").eq("id", "d5518095-7877-44fb-b788-7f3832b94a97").single();
  console.log("Trip ID:", data?.id);
  console.log("Title:", data?.title);
  console.log("Status:", data?.status);
  console.log("Total Packing Items:", data?.itinerary_data?.packing_list?.length);
  console.log("\n🎒 4 大類行李清單驗收：");
  data?.itinerary_data?.packing_list?.forEach(p => {
    console.log(`  [${p.category}] ${p.item_name} (${p.notes})`);
  });
}
check();
