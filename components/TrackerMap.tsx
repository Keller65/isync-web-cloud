"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useTrackerDevices } from "@/hooks/useTrackerDevices";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function TrackerMap() {

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

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

        const geojson = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: device.history
          }
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

  return (
    <div className="w-full h-[92vh]">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );

}