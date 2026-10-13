"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Logo3DProps {
  className?: string;
  interactive?: boolean;
}

export function LogoCube3D({ className = "", interactive = true }: Logo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 4.0); // Royal blue
    dirLight1.position.set(5, 6, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 2.5); // Sky blue rim
    dirLight2.position.set(-5, -4, -3);
    scene.add(dirLight2);

    const mouseLight = new THREE.PointLight(0x93c5fd, 3.0, 10);
    mouseLight.position.set(0, 0, 4);
    scene.add(mouseLight);

    // 5. Main 3D Container Object
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 6. Texture Loader for the Logo Emblem
    const textureLoader = new THREE.TextureLoader();
    let logoTexture: THREE.Texture | null = null;

    // Rounded Chamfer Box / Monolith Geometry
    const boxGeometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);

    // Dark sleek high-tech slate material for sides
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a1324,
      metalness: 0.85,
      roughness: 0.25,
    });

    textureLoader.load(
      "/logo-512.png",
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        logoTexture = texture;

        const faceMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          color: 0xffffff,
          metalness: 0.6,
          roughness: 0.2,
          emissive: 0x1e3a8a,
          emissiveIntensity: 0.15,
        });

        // Apply logo on all 4 vertical faces, edge material on top & bottom
        const materials = [
          faceMaterial, // right
          faceMaterial, // left
          edgeMaterial, // top
          edgeMaterial, // bottom
          faceMaterial, // front
          faceMaterial, // back
        ];

        const cube = new THREE.Mesh(boxGeometry, materials);
        rootGroup.add(cube);
        setIsLoaded(true);
      },
      undefined,
      () => {
        // Fallback if texture load fails: show sleek geometric core
        const fallbackMat = new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          metalness: 0.7,
          roughness: 0.3,
        });
        const cube = new THREE.Mesh(boxGeometry, fallbackMat);
        rootGroup.add(cube);
        setIsLoaded(true);
      }
    );

    // 7. Glowing Outer Wireframe Accent Cage
    const wireframeGeom = new THREE.BoxGeometry(2.18, 2.18, 2.18);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireframeCube = new THREE.Mesh(wireframeGeom, wireframeMat);
    rootGroup.add(wireframeCube);

    // 8. Orbital Telemetry Rings (Representing global route orbits)
    const ringGroup = new THREE.Group();
    rootGroup.add(ringGroup);

    // Ring 1 (Equatorial / tilted)
    const ring1Geom = new THREE.TorusGeometry(2.4, 0.018, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    ringGroup.add(ring1);

    // Ring 2 (Polar / counter-tilted)
    const ring2Geom = new THREE.TorusGeometry(2.7, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    ringGroup.add(ring2);

    // 9. 42 Telemetry Node Points (representing 42 connected distribution hubs)
    const particleCount = 42;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    ringGroup.add(particles);

    // 10. Mouse Interaction & Inertia Physics
    let targetRotationX = 0.35;
    let targetRotationY = 0.55;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseLight.position.x = normX * 3;
      mouseLight.position.y = normY * 3;

      if (isDragging && interactive) {
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // 11. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous autonomous rotation when not actively dragging
      if (!isDragging) {
        targetRotationY += delta * 0.45;
        targetRotationX = 0.25 + Math.sin(elapsedTime * 0.6) * 0.12;
      }

      // Smooth inertia interpolation
      rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.08;
      rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.08;

      // Rotate orbital rings counter-clockwise
      ring1.rotation.z += delta * 0.3;
      ring2.rotation.z -= delta * 0.25;
      particles.rotation.y += delta * 0.15;

      // Gentle floating bob
      rootGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 12. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      resizeObserver.disconnect();

      boxGeometry.dispose();
      wireframeGeom.dispose();
      ring1Geom.dispose();
      ring2Geom.dispose();
      particleGeom.dispose();
      wireframeMat.dispose();
      ring1Mat.dispose();
      ring2Mat.dispose();
      particleMat.dispose();
      edgeMaterial.dispose();
      if (logoTexture) logoTexture.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      className={`relative select-none touch-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading & Hover Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 animate-pulse flex items-center justify-center">
            <span className="text-blue-500 text-xs font-mono">3D LOGO</span>
          </div>
        </div>
      )}

      {/* Subtle interaction tip */}
      <div
        className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 dark:bg-black/80 px-3 py-1 text-[10px] font-mono font-medium text-slate-300 backdrop-blur-md transition-opacity duration-300 ${
          isHovered ? "opacity-90" : "opacity-0"
        }`}
      >
        <span>Drag to rotate in 3D</span>
      </div>
    </div>
  );
}
