"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

export interface MapActivity {
  id: string;
  name: string;
  coordinates?: { lat: number; lng: number };
  timeSlot?: string;
}

interface InteractiveMapProps {
  activities: MapActivity[];
  activeActivityId?: string;
  onActivitySelect?: (activityId: string) => void;
  className?: string;
}

function parseCoords(coordObj: any): { lat: number; lng: number } | null {
  if (!coordObj) return null;
  const lat = typeof coordObj.lat === "number" ? coordObj.lat : parseFloat(coordObj.lat || coordObj.latitude);
  const lng = typeof coordObj.lng === "number" ? coordObj.lng : parseFloat(coordObj.lng || coordObj.longitude);
  if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    return { lat, lng };
  }
  return null;
}

function createMarkerIcon(active: boolean, index: number, isHotel: boolean = false) {
  const badgeText = isHotel ? "🏨" : `${index + 1}`;
  return L.divIcon({
    className: "atrip-leaflet-marker-wrapper",
    html: `
      <div class="atrip-map-pin ${active ? "is-active" : ""} ${isHotel ? "is-hotel" : ""}">
        <div class="atrip-map-pin-inner">${badgeText}</div>
        <div class="atrip-map-pin-arrow"></div>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  });
}

function MapViewportController({
  activities,
  activeActivityId,
}: Pick<InteractiveMapProps, "activities" | "activeActivityId">) {
  const map = useMap();
  const validPoints = useMemo(() => {
    return activities
      .map((activity, idx) => ({
        ...activity,
        coords: parseCoords(activity.coordinates),
        index: idx,
      }))
      .filter((a): a is typeof a & { coords: { lat: number; lng: number } } => !!a.coords);
  }, [activities]);

  const initialFitDone = useRef(false);

  // 1. 確保切換分頁或手機展開地圖時自動重新計算尺寸 (避免破圖)
  useEffect(() => {
    map.invalidateSize();
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map, activities]);

  // 2. 自動調整地圖邊界以容納所有標記點
  useEffect(() => {
    if (!validPoints.length) return;
    const bounds = L.latLngBounds(
      validPoints.map((p) => [p.coords.lat, p.coords.lng])
    );
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14, animate: true });
    initialFitDone.current = true;
  }, [map, validPoints]);

  // 3. 點選活動時平滑聚焦
  useEffect(() => {
    if (!activeActivityId || !validPoints.length) return;
    const target = validPoints.find((p) => p.id === activeActivityId);
    if (!target || !target.coords) return;

    try {
      map.invalidateSize();
      const currentZoom = typeof map.getZoom === 'function' ? (map.getZoom() || 13) : 13;
      const targetZoom = Math.max(currentZoom, 15);
      map.flyTo([target.coords.lat, target.coords.lng], targetZoom, {
        animate: true,
        duration: 0.8,
      });
    } catch (e) {
      try {
        map.setView([target.coords.lat, target.coords.lng], 15);
      } catch (e2) {}
    }
  }, [activeActivityId, map, validPoints]);

  return null;
}

export default function InteractiveMap({
  activities,
  activeActivityId,
  onActivitySelect,
  className = "h-[360px] w-full",
}: InteractiveMapProps) {
  const parsedActivities = useMemo(() => {
    return activities.map((activity, index) => {
      const isHotel =
        activity.name?.includes("飯店") ||
        activity.name?.includes("Check-in") ||
        activity.id?.includes("hotel");
      return {
        ...activity,
        parsedCoords: parseCoords(activity.coordinates),
        index,
        isHotel,
      };
    });
  }, [activities]);

  const validPoints = parsedActivities.filter((a) => a.parsedCoords);

  const initialCenter: [number, number] = validPoints[0]?.parsedCoords
    ? [validPoints[0].parsedCoords.lat, validPoints[0].parsedCoords.lng]
    : [35.6812, 139.7671];

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 ${className} relative touch-auto`}>
      {validPoints.length ? (
        <MapContainer
          center={initialCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full min-h-full w-full"
          aria-label="行程互動地圖"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <MapViewportController
            activities={activities}
            activeActivityId={activeActivityId}
          />
          {validPoints.map((activity) => {
            const isActive = activity.id === activeActivityId;
            return (
              <Marker
                key={activity.id}
                position={[activity.parsedCoords!.lat, activity.parsedCoords!.lng]}
                icon={createMarkerIcon(isActive, activity.index, activity.isHotel)}
                zIndexOffset={isActive ? 1000 : 0}
                eventHandlers={{
                  click: () => onActivitySelect?.(activity.id),
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 font-sans">
                    <div className="text-[10px] font-bold text-brand-primary">
                      {activity.isHotel ? "🏨 住宿基地" : `Step ${activity.index + 1}`}
                      {activity.timeSlot ? ` · ${activity.timeSlot}` : ""}
                    </div>
                    <strong className="text-xs font-bold block mt-0.5">{activity.name}</strong>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      ) : (
        <div className="flex h-full min-h-[220px] items-center justify-center p-6 text-center text-xs text-slate-500 font-medium">
          📍 目前沒有可顯示的景點座標。
        </div>
      )}
    </div>
  );
}

