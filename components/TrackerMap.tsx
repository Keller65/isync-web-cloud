"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import simplify from "@turf/simplify";
import { useTrackerDevices } from "@/hooks/useTrackerDevices";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function TrackerMap() {

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const animationRef = useRef<number | NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);

  const devices = useTrackerDevices();

  useEffect(() => {

    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-88.03, 15.5],
      zoom: 12
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl());

  }, []);

  useEffect(() => {

    if (!mapRef.current) return;

    const map = mapRef.current;

    if (!map.isStyleLoaded()) {
      map.once("load", () => {
        updateMarkersAndRoutes();
      });
      return;
    }

    updateMarkersAndRoutes();

    function updateMarkersAndRoutes() {
      devices.forEach((device) => {

        const [lng, lat] = device.position;

        let marker = markersRef.current.get(device.id);

        if (!marker) {

          marker = new mapboxgl.Marker({ color: "#ef4444", draggable: false })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <strong>${device.id}</strong><br/>
                Velocidad: ${device.speed ?? 0} km/h
              `)
            )
            .addTo(map);

          markersRef.current.set(device.id, marker);

        } else {

          marker.setLngLat([lng, lat]);
          const popup = marker.getPopup();
          if (popup) {
            popup.setHTML(`
              <strong>${device.id}</strong><br/>
              Velocidad: ${device.speed ?? 0} km/h
            `);
          }

        }

        const routeId = `route-${device.id}`;

        const simplified = simplify(
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: device.history
            },
            properties: {}
          },
          { tolerance: 0.00001, highQuality: false }
        );

        const geojson = {
          type: "Feature",
          geometry: simplified.geometry
        };

        if (map.getSource(routeId)) {

          (map.getSource(routeId) as mapboxgl.GeoJSONSource).setData(geojson as any);

        } else {

          map.addSource(routeId, {
            type: "geojson",
            data: geojson as any
          });

          map.addLayer({
            id: routeId,
            type: "line",
            source: routeId,
            paint: {
              "line-width": 4,
              "line-color": "#3b82f6"
            }
          });

        }

      });
    }

  }, [devices]);

  function calculateSpeed(pos1: [number, number], pos2: [number, number], time1: Date, time2: Date): number {
    const distance = Math.sqrt(
      Math.pow(pos2[0] - pos1[0], 2) + Math.pow(pos2[1] - pos1[1], 2)
    );
    const timeDiff = (time2.getTime() - time1.getTime()) / 1000 / 3600;
    if (timeDiff === 0) return 0;
    const kmPerHour = (distance * 111) / timeDiff;
    return Math.round(kmPerHour * 10) / 10;
  }

  function startAnimation() {
    if (!devices.length || !devices[0].history.length) return;
    
    const history = devices[0].history;
    const timestamps = devices[0].timestamps || [];
    
    setIsPlaying(true);
    
    let index = currentIndex;
    
    const animate = () => {
      if (index >= history.length - 1) {
        setIsPlaying(false);
        return;
      }
      
      const pos = history[index];
      const marker = markersRef.current.get(devices[0].id);
      if (marker) {
        marker.setLngLat(pos);
        
        if (timestamps[index] && timestamps[index + 1]) {
          const speed = calculateSpeed(
            history[index],
            history[index + 1],
            timestamps[index],
            timestamps[index + 1]
          );
          setCurrentSpeed(speed);
          
          const popup = marker.getPopup();
          if (popup) {
            popup.setHTML(`
              <strong>${devices[0].id}</strong><br/>
              Velocidad: ${speed} km/h<br/>
              Posición: ${index + 1}/${history.length}
            `);
          }
        }
      }
      
      index++;
      setCurrentIndex(index);
      
      if (isPlaying) {
        animationRef.current = setTimeout(() => {
          requestAnimationFrame(animate);
        }, 500);
      }
    };
    
    animate();
  }

  function stopAnimation() {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }

  function resetAnimation() {
    stopAnimation();
    setCurrentIndex(0);
    setCurrentSpeed(0);
    if (devices.length && devices[0].history.length) {
      const marker = markersRef.current.get(devices[0].id);
      if (marker) {
        marker.setLngLat(devices[0].history[0]);
      }
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        if (typeof animationRef.current === 'number') {
          cancelAnimationFrame(animationRef.current);
        } else {
          clearTimeout(animationRef.current);
        }
      }
    };
  }, []);

  return (
    <div className="w-full h-[92vh] relative">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10 flex flex-col gap-2">
        <div className="font-bold">Control de Animación</div>
        <div className="text-sm">Velocidad actual: <span className="font-bold text-blue-600">{currentSpeed} km/h</span></div>
        <div className="text-sm">Posición: {currentIndex} / {devices[0]?.history.length || 0}</div>
        <div className="flex gap-2">
          {!isPlaying ? (
            <button 
              onClick={startAnimation}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ▶ Play
            </button>
          ) : (
            <button 
              onClick={stopAnimation}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ⏸ Pausa
            </button>
          )}
          <button 
            onClick={resetAnimation}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ↺ Reset
          </button>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
        <div className="font-bold mb-2">Línea de Tiempo</div>
        <input
          type="range"
          min="0"
          max={(devices[0]?.history.length || 1) - 1}
          value={currentIndex}
          onChange={(e) => {
            const idx = parseInt(e.target.value);
            setCurrentIndex(idx);
            const pos = devices[0]?.history[idx];
            if (pos) {
              const marker = markersRef.current.get(devices[0].id);
              if (marker) marker.setLngLat(pos);
            }
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {devices[0]?.timestamps?.[0] && (
            <span>{devices[0].timestamps[0].toLocaleString()}</span>
          )}
          {devices[0]?.timestamps?.[currentIndex] && (
            <span className="text-blue-600 font-bold">
              {devices[0].timestamps[currentIndex].toLocaleTimeString()}
            </span>
          )}
          {devices[0]?.timestamps?.[devices[0].history.length - 1] && (
            <span>{devices[0].timestamps[devices[0].history.length - 1].toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );

}