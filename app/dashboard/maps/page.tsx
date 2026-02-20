"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (mapboxToken && !mapboxToken.startsWith("pk.")) {
  console.warn(
    "Mapbox: Se detectó un token secreto (sk.*). Para uso en el cliente, se debe utilizar un token de acceso público (pk.*) por razones de seguridad."
  );
}

mapboxgl.accessToken = mapboxToken || "";

export default function Page() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/aerleyadkins/cmltpyifw001i01qw3y31gmjs", // más limpio
      center: [-74.5, 40],
      zoom: 9,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Solicitar ubicación del usuario
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            const userLocation: [number, number] = [longitude, latitude];

            // Definir un punto de destino (ejemplo: +0.01 de diferencia)
            const destination: [number, number] = [
              longitude + 0.01,
              latitude + 0.01,
            ];

            // Centrar el mapa para que se vean ambos puntos
            const bounds = new mapboxgl.LngLatBounds()
              .extend(userLocation)
              .extend(destination);

            map.fitBounds(bounds, { padding: 50 });

            // Añadir marcador de origen (Usuario)
            new mapboxgl.Marker({ color: "#3b82f6" })
              .setLngLat(userLocation)
              .setPopup(
                new mapboxgl.Popup().setHTML("<h3>Tu ubicación actual</h3>")
              )
              .addTo(map);

            // Añadir marcador de destino
            new mapboxgl.Marker({ color: "#ef4444" })
              .setLngLat(destination)
              .setPopup(new mapboxgl.Popup().setHTML("<h3>Destino</h3>"))
              .addTo(map);

            // Función para obtener la ruta real (siguiendo calles)
            const getRoute = async (start: [number, number], end: [number, number]) => {
              try {
                const query = await fetch(
                  `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                  { method: "GET" }
                );
                const json = await query.json();
                const data = json.routes[0];
                const route = data.geometry.coordinates;

                const geojson: GeoJSON.Feature = {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: route,
                  },
                };

                // Si la fuente ya existe, actualizamos los datos, si no, la creamos
                if (map.getSource("route")) {
                  (map.getSource("route") as mapboxgl.GeoJSONSource).setData(geojson);
                } else {
                  map.addSource("route", {
                    type: "geojson",
                    data: geojson,
                  });

                  map.addLayer({
                    id: "route",
                    type: "line",
                    source: "route",
                    layout: {
                      "line-join": "round",
                      "line-cap": "round",
                    },
                    paint: {
                      "line-color": "#3b82f6",
                      "line-width": 5,
                      "line-opacity": 0.75,
                    },
                  });
                }
              } catch (error) {
                console.error("Error al trazar la ruta:", error);
              }
            };

            // Ejecutar la obtención de la ruta
            getRoute(userLocation, destination);
          },
          (error) => {
            console.error("Error obteniendo la ubicación:", error);
          },
          { enableHighAccuracy: true }
        );
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="h-[86vh]">
      <div className="h-full rounded-2xl overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
