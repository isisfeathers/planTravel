import { notFound } from "next/navigation";

import { WaitingCanvas } from "@/components/waiting/WaitingCanvas";
export function generateStaticParams() {
  return [
    { id: 'demo' },
    { id: '7a7d32da-59f2-4a73-b5f0-204840b06060' },
    { id: 'mock-itinerary-id' },
  ];
}


export default function WaitingPage({ params }: { params: { id: string } }) {
  if (!params.id.trim()) notFound();
  return <WaitingCanvas itineraryId={params.id} />;
}
