"use client";

import { useEffect, useMemo } from "react";
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

function createMarkerIcon(active: boolean) {
  return L.divIcon({
    className: "atrip-leaflet-marker-wrapper",
    html: `<span class="atrip-leaflet-marker${active ? " is-active" : ""}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function MapViewportController({
  activities,
  activeActivityId,
}: Pick<InteractiveMapProps, "activities" | "activeActivityId">) {
  const map = useMap();
  const points = useMemo(
    () => activities.filter((activity) => activity.coordinates),
    [activities],
  );

  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(
      points.map((activity) => [
        activity.coordinates!.lat,
        activity.coordinates!.lng,
      ]),
    );
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14, animate: true });
  }, [map, points]);

  useEffect(() => {
    if (!activeActivityId) return;
    const active = points.find((activity) => activity.id === activeActivityId);
    if (!active?.coordinates) return;
    map.flyTo(
      [active.coordinates.lat, active.coordinates.lng],
      Math.max(map.getZoom(), 15),
      { animate: true, duration: 0.8 },
    );
  }, [activeActivityId, map, points]);

  return null;
}

export default function InteractiveMap({
  activities,
  activeActivityId,
  onActivitySelect,
  className = "h-[360px] w-full",
}: InteractiveMapProps) {
  const points = activities.filter((activity) => activity.coordinates);
  const initialCenter: [number, number] = points[0]?.coordinates
    ? [points[0].coordinates.lat, points[0].coordinates.lng]
    : [35.6812, 139.7671];

  return (
    <div className={`overflow-hidden rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-subtle ${className}`}>
      {points.length ? (
        <MapContainer
          center={initialCenter}
          zoom={13}
          scrollWheelZoom
          className="h-full min-h-full w-full"
          aria-label="行程互動地圖"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewportController
            activities={activities}
            activeActivityId={activeActivityId}
          />
          {points.map((activity) => (
            <Marker
              key={activity.id}
              position={[activity.coordinates!.lat, activity.coordinates!.lng]}
              icon={createMarkerIcon(activity.id === activeActivityId)}
              eventHandlers={{
                click: () => onActivitySelect?.(activity.id),
              }}
            >
              <Popup>
                <strong>{activity.name}</strong>
                {activity.timeSlot ? <span className="block">{activity.timeSlot}</span> : null}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex h-full min-h-[220px] items-center justify-center p-atrip-6 text-center text-atrip-body text-atrip-text-secondary">
          目前沒有可顯示的活動座標。
        </div>
      )}
    </div>
  );
}
