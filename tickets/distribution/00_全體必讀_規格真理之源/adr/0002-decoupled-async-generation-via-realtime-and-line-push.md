# 2. Dual-Track Asynchronous Generation via Supabase Realtime and LINE Messaging Push

We chose a decoupled, event-driven architecture where itinerary generation is triggered via a database webhook to n8n, with completion signaled through both Supabase Realtime (WebSocket) and LINE Messaging API (Flex Message Push), instead of holding an open synchronous HTTP request.

LLM structured generation combined with flight search APIs takes 15 to 40 seconds. Holding a synchronous HTTP connection inside LINE's in-app browser (LIFF) frequently leads to gateway timeouts, network drops when the user switches apps, and white-screen freezes. The dual-track strategy ensures that users who stay on the page receive instant real-time UI hydration, while users who close or background LIFF receive a rich message in their LINE chat room, re-engaging them without lost work.
