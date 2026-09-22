import { notFound } from "next/navigation";

import { WaitingCanvas } from "@/components/waiting/WaitingCanvas";

export default function WaitingPage({ params }: { params: { id: string } }) {
  if (!params.id.trim()) notFound();
  return <WaitingCanvas itineraryId={params.id} />;
}
