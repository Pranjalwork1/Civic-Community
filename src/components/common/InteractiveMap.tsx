import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface InteractiveMapProps {
  lat: number;
  lng: number;
  onPositionChange?: (lat: number, lng: number) => void;
  isDraggable?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  lat,
  lng,
  onPositionChange,
  isDraggable = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Fix default marker icon issue in Leaflet with Vite/bundlers
      const customPinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div style="
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          background: #0284c7;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -20px 0 0 -16px;
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], {
        icon: customPinIcon,
        draggable: isDraggable,
      }).addTo(map);

      if (isDraggable) {
        marker.on('dragend', () => {
          const newPos = marker.getLatLng();
          if (onPositionChange) {
            onPositionChange(Number(newPos.lat.toFixed(5)), Number(newPos.lng.toFixed(5)));
          }
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          if (onPositionChange) {
            onPositionChange(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
          }
        });
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    return () => {
      // Keep map alive or cleanup on full unmount
    };
  }, [lat, lng, isDraggable]);

  // Handle container resizing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="map-preview-container">
      <div ref={mapContainerRef} className="leaflet-map-host" />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#475467',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        📍 Illustrative map · Pin can be adjusted by clicking or dragging
      </div>
    </div>
  );
};
