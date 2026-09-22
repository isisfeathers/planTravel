import { CanvasClient } from "./CanvasClient";

export function generateStaticParams() {
  return [
    { id: "demo" },
    { id: "7a7d32da-59f2-4a73-b5f0-204840b06060" },
    { id: "e61b4ee2-9fc4-4aad-8bbd-5f245333b200" },
    { id: "7f6996b4-6d26-4282-9952-0f5709529da4" },
    { id: "0f0c68d3-5691-48a2-a1e9-f0c39243bcb2" },
    { id: "2624ffa8-a40e-4cfe-8b6b-7bd1189b5b75" },
    { id: "8d1da0a2-0275-4d4a-a417-7c27aeb5a03e" },
    { id: "mock-itinerary-id" },
  ];
}

export default function CanvasPage({ params }: { params: { id: string } }) {
  return <CanvasClient params={params} />;
}