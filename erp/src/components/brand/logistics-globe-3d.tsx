"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Hub = {
  name: string;
  code: string;
  lat: number;
  lng: number;
};

const HUBS: Hub[] = [
  { name: "Mumbai Central Hub", code: "BOM", lat: 19.076, lng: 72.8777 },
  { name: "Delhi Dispatch Core", code: "DEL", lat: 28.7041, lng: 77.1025 },
  { name: "Bengaluru Logistics Hub", code: "BLR", lat: 12.9716, lng: 77.5946 },
  { name: "Dubai Freight Node", code: "DXB", lat: 25.2048, lng: 55.2708 },
  { name: "Singapore Gateway", code: "SIN", lat: 1.3521, lng: 103.8198 },
  { name: "Tokyo Terminal", code: "HND", lat: 35.6762, lng: 139.6503 },
  { name: "Frankfurt Cargo Core", code: "FRA", lat: 50.1109, lng: 8.6821 },
  { name: "London Logistics Hub", code: "LHR", lat: 51.5074, lng: -0.1278 },
  { name: "New York Port Gateway", code: "JFK", lat: 40.7128, lng: -74.006 },
];

const ROUTES: [number, number][] = [
  [0, 1], // BOM -> DEL
  [0, 2], // BOM -> BLR
  [0, 3], // BOM -> DXB
  [0, 4], // BOM -> SIN
  [1, 6], // DEL -> FRA
  [4, 5], // SIN -> HND
  [6, 7], // FRA -> LHR
  [7, 8], // LHR -> JFK
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function LogisticsGlobe3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 210;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeRadius = 60;
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Initial slight tilt
    globeGroup.rotation.x = 0.35;
    globeGroup.rotation.y = -1.2;

    const isDark = document.documentElement.classList.contains("dark");
    const primaryColor = isDark ? 0x3b82f6 : 0x2563eb;
    const cyanColor = isDark ? 0x38bdf8 : 0x0284c7;
    const dotColor = isDark ? 0x93c5fd : 0x3b82f6;

    // 1. Fibonacci Dot-Matrix Sphere (1,200 particle nodes)
    const particleCount = 1200;
    const particlePositions = new Float32Array(particleCount * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      particlePositions[i * 3] = x * globeRadius;
      particlePositions[i * 3 + 1] = y * globeRadius;
      particlePositions[i * 3 + 2] = z * globeRadius;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: dotColor,
      size: 1.3,
      transparent: true,
      opacity: isDark ? 0.6 : 0.5,
    });
    const particlePoints = new THREE.Points(particlesGeo, particlesMat);
    globeGroup.add(particlePoints);

    // 2. Delicate Wireframe Inner Core
    const wireGeo = new THREE.IcosahedronGeometry(globeRadius * 0.99, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.12 : 0.08,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 3. Hub Nodes & Pulse Rings
    const hubVectors: THREE.Vector3[] = HUBS.map((h) =>
      latLngToVector3(h.lat, h.lng, globeRadius)
    );

    const hubGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const hubMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const hubPulseMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });

    hubVectors.forEach((vec) => {
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hubMesh.position.copy(vec);
      globeGroup.add(hubMesh);

      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(1.8, 3.2, 24), hubPulseMat);
      ringMesh.position.copy(vec);
      ringMesh.lookAt(0, 0, 0);
      globeGroup.add(ringMesh);
    });

    // 4. Parabolic Flight Arcs with Traveling Photon Packets
    const curves: THREE.CubicBezierCurve3[] = [];
    const pulsePackets: { curve: THREE.CubicBezierCurve3; mesh: THREE.Mesh; t: number; speed: number }[] = [];

    ROUTES.forEach(([startIdx, endIdx]) => {
      const start = hubVectors[startIdx];
      const end = hubVectors[endIdx];

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      const elevation = globeRadius + distance * 0.28;
      mid.normalize().multiplyScalar(elevation);

      const cp1 = new THREE.Vector3().lerpVectors(start, mid, 0.5).normalize().multiplyScalar(elevation * 0.95);
      const cp2 = new THREE.Vector3().lerpVectors(end, mid, 0.5).normalize().multiplyScalar(elevation * 0.95);

      const curve = new THREE.CubicBezierCurve3(start, cp1, cp2, end);
      curves.push(curve);

      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: cyanColor,
        transparent: true,
        opacity: isDark ? 0.65 : 0.55,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);

      // Traveling photon packet
      const packetGeo = new THREE.SphereGeometry(1.2, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      packet.position.copy(start);
      globeGroup.add(packet);

      pulsePackets.push({
        curve,
        mesh: packet,
        t: Math.random(),
        speed: 0.0035 + Math.random() * 0.002,
      });
    });

    // 5. Orbital Gimbal Rings
    const ring1Geo = new THREE.RingGeometry(globeRadius * 1.25, globeRadius * 1.256, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDark ? 0.2 : 0.15,
    });
    const orbitRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    orbitRing1.rotation.x = Math.PI / 2.3;
    globeGroup.add(orbitRing1);

    // 6. Interactive Controls (Mouse Drag Orbit & Parallax)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotSpeedX = 0;
    let rotSpeedY = 0.0022;
    let targetTiltX = 0;
    let targetTiltY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;
        rotSpeedY = deltaX * 0.001;
        rotSpeedX = deltaY * 0.001;
      } else {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / height) * 2 - 1);
        targetTiltX = ny * 0.15;
        targetTiltY = nx * 0.2;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging = true;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;
      }
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    container.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    // 7. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        globeGroup.rotation.y += rotSpeedY;
        globeGroup.rotation.x += rotSpeedX;
        rotSpeedY = THREE.MathUtils.lerp(rotSpeedY, 0.0018, 0.03);
        rotSpeedX = THREE.MathUtils.lerp(rotSpeedX, 0, 0.03);

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetTiltY * 20, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetTiltX * 20, 0.05);
        camera.lookAt(0, 0, 0);
      }

      pulsePackets.forEach((p) => {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
        const pos = p.curve.getPoint(p.t);
        p.mesh.position.copy(pos);
      });

      orbitRing1.rotation.z += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      hubGeo.dispose();
      hubMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
    };
  }, []);

  return (
    <div className="relative h-full w-full select-none">
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        title="Click & drag to rotate 3D freight network"
      />
    </div>
  );
}
