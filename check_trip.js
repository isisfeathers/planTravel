const { createClient } = require('./frontend/node_modules/@supabase/supabase-js');
const supabase = createClient("https://fvnxaksfcftatvxddhpx.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bnhha3NmY2Z0YXR2eGRkaHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTUzMjk5OCwiZXhwIjoyMTA1MTA4OTk4fQ.a2n_6uHAugC5IeddlGG3wIHoZn4l5Z_lskV-IUrRzQk");

async function check() {
  const { data, error } = await supabase.from('itineraries').select('*').eq('id', '9958cdde-098a-43c3-ae77-be6acd117647').single();
  if (error) console.error("Error:", error);
  console.log("STATUS:", data?.status);
  console.log("META:", data?.itinerary_data?.meta);
  console.log("DAY 1:", data?.itinerary_data?.daily_itinerary?.[0]?.date_label, "Act 1:", data?.itinerary_data?.daily_itinerary?.[0]?.activities?.[0]?.location_name, data?.itinerary_data?.daily_itinerary?.[0]?.activities?.[0]?.time_slot);
  console.log("DAY 4:", data?.itinerary_data?.daily_itinerary?.[3]?.date_label, "Last Act:", data?.itinerary_data?.daily_itinerary?.[3]?.activities?.slice(-1)[0]?.location_name, data?.itinerary_data?.daily_itinerary?.[3]?.activities?.slice(-1)[0]?.time_slot);
}
setTimeout(check, 6000);


