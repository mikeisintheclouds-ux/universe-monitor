"use client";

import { useEffect, useRef } from "react";
import type { IssState, Observer } from "@/lib/types";
import {
  defaultTrueColorLayer,
  gibsRecommendedDate,
  gibsTileUrlTemplate,
} from "@/lib/gibs";

type Props = {
  iss: IssState | null;
  observer: Observer;
};

/**
 * MapLibre GL + NASA GIBS true-color base.
 * Markers: observer (green) · ISS (amber).
 */
export function EarthMap({ iss, observer }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let map: any = null;

    async function boot() {
      if (!containerRef.current || mapRef.current) return;

      const maplibregl = (await import("maplibre-gl")).default;
      // @ts-expect-error CSS import resolved by bundler
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (cancelled || !containerRef.current) return;

      const layer = defaultTrueColorLayer();
      const time = gibsRecommendedDate(2);
      const template = gibsTileUrlTemplate(layer, time);
      const tileUrls = ["a", "b", "c"].map((s) => template.replace("{s}", s));

      map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            gibs: {
              type: "raster",
              tiles: tileUrls,
              tileSize: 256,
              attribution:
                "Imagery: NASA GIBS / ESDIS · MODIS Terra Corrected Reflectance",
              maxzoom: layer.maxZoom,
            },
          },
          layers: [
            {
              id: "gibs-truecolor",
              type: "raster",
              source: "gibs",
              minzoom: 0,
              maxzoom: layer.maxZoom,
            },
          ],
        },
        center: [observer.longitude, observer.latitude],
        zoom: 2.4,
        minZoom: 1,
        maxZoom: layer.maxZoom,
        attributionControl: { compact: true },
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      map.on("load", () => {
        const obsEl = document.createElement("div");
        obsEl.className = "um-marker um-marker-obs";
        obsEl.title = `Observer · ${observer.label}`;
        obsEl.innerHTML = `<span>YOU</span>`;
        new maplibregl.Marker({ element: obsEl })
          .setLngLat([observer.longitude, observer.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 16 }).setHTML(
              `<strong>Observer</strong><br/>${observer.label}<br/>${observer.latitude.toFixed(4)}, ${observer.longitude.toFixed(4)}`
            )
          )
          .addTo(map);

        if (iss) {
          const issEl = document.createElement("div");
          issEl.className = "um-marker um-marker-iss";
          issEl.title = "ISS";
          issEl.innerHTML = `<span>ISS</span>`;
          new maplibregl.Marker({ element: issEl })
            .setLngLat([iss.longitude, iss.latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 16 }).setHTML(
                `<strong>International Space Station</strong><br/>` +
                  `${iss.latitude.toFixed(2)}°, ${iss.longitude.toFixed(2)}°<br/>` +
                  `Alt ${Math.round(iss.altitudeKm)} km · ${Math.round(iss.velocityKph).toLocaleString()} km/h`
              )
            )
            .addTo(map);
        }
      });

      mapRef.current = map;
    }

    boot().catch(() => {});

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [iss, observer]);

  return (
    <div className="earth-map-shell">
      <div ref={containerRef} className="earth-map-canvas" />
      <div className="earth-map-caption">
        NASA GIBS · MODIS Terra true color · {gibsRecommendedDate(2)} · ISS +
        observer lock
      </div>
    </div>
  );
}
