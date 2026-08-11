"use client";

import { useEffect, useRef } from "react";
import type { PlanetState } from "@/lib/types";
import { alignmentLabel, alignmentScore } from "@/lib/astro";

export function Solar3D({ planets }: { planets: PlanetState[] }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const score = alignmentScore(planets);

  useEffect(() => {
    let cancelled = false;
    let renderer: any;
    let anim = 0;

    async function boot() {
      if (!mountRef.current) return;
      const THREE = await import("three");
      if (cancelled || !mountRef.current) return;

      const w = mountRef.current.clientWidth || 800;
      const h = mountRef.current.clientHeight || 420;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      mountRef.current.innerHTML = "";
      mountRef.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
      camera.position.set(0, 18, 32);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0x6b7cff, 0.55));
      const sunLight = new THREE.PointLight(0xffe08a, 2.2, 80);
      scene.add(sunLight);

      const sun = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
      );
      scene.add(sun);

      const planetMeshes: { mesh: any; angle: number; speed: number; r: number }[] =
        [];

      planets.forEach((p, i) => {
        const r = 3.2 + i * 2.1;
        const geo = new THREE.SphereGeometry(
          p.name === "Earth" ? 0.45 : 0.32,
          16,
          16
        );
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(p.color),
          emissive: new THREE.Color(p.color),
          emissiveIntensity: 0.25,
        });
        const mesh = new THREE.Mesh(geo, mat);
        const rad = (p.longitude * Math.PI) / 180;
        mesh.position.set(Math.cos(rad) * r, 0, Math.sin(rad) * r);
        scene.add(mesh);
        planetMeshes.push({
          mesh,
          angle: rad,
          speed: 0.002 + i * 0.0004,
          r,
        });

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(r - 0.02, r + 0.02, 64),
          new THREE.MeshBasicMaterial({
            color: 0x334155,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35,
          })
        );
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
      });

      const span = Math.max(8, Math.min(80, score));
      const wedge = new THREE.Mesh(
        new THREE.CircleGeometry(14, 48, 0, (span * Math.PI) / 180),
        new THREE.MeshBasicMaterial({
          color: 0xa78bfa,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide,
        })
      );
      wedge.rotation.x = -Math.PI / 2;
      scene.add(wedge);

      const clock = new THREE.Clock();
      function loop() {
        anim = requestAnimationFrame(loop);
        const t = clock.getElapsedTime();
        sun.rotation.y = t * 0.2;
        planetMeshes.forEach((pm) => {
          pm.angle += pm.speed;
          pm.mesh.position.set(
            Math.cos(pm.angle) * pm.r,
            Math.sin(t * 0.4 + pm.r) * 0.15,
            Math.sin(pm.angle) * pm.r
          );
        });
        camera.position.x = Math.sin(t * 0.08) * 6;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      }
      loop();
    }

    boot();
    return () => {
      cancelled = true;
      cancelAnimationFrame(anim);
      if (renderer) {
        renderer.dispose();
        renderer.domElement?.remove();
      }
    };
  }, [planets, score]);

  return (
    <div className="solar3d-shell">
      <div ref={mountRef} className="solar3d-canvas" />
      <div className="earth-map-caption">
        Solar system · Three.js · alignment {alignmentLabel(score)} · span{" "}
        {score.toFixed(0)}°
      </div>
    </div>
  );
}
