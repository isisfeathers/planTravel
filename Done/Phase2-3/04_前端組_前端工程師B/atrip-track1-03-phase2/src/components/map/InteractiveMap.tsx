'use client';
import React from 'react';

/**
 * TRACK1-06: 互動地圖 (Mapbox / Leaflet) 元件
 * 
 * 1. 依據傳入的 activities 動態標記 Custom Markers
 * 2. 實作 `fitBounds` 自適應縮放
 * 3. 實作 `map.flyTo({ center: [lng, lat], zoom: 15 })` 平滑聯動
 */
interface InteractiveMapProps {
  activities: Array<{
    id: string;
    name: string;
    coordinates?: { lat: number; lng: number };
  }>;
  activeActivityId?: string;
}

export default function InteractiveMap({ activities, activeActivityId }: InteractiveMapProps) {
  // TODO: 實作 Leaflet 或 Mapbox 地圖渲染
  
  return (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-xl">
      <span className="text-gray-500">地圖元件載入中... (待實作)</span>
    </div>
  );
}
