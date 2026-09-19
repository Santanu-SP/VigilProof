import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleWave() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene setup ──────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 28);

    const renderer = new THREE.WebGLRenderer({
      canvas: mount,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ── Particle grid ────────────────────────────────────
    const COLS = 100;
    const ROWS = 80;
    const COUNT = COLS * ROWS;
    const SPREAD_X = 60;
    const SPREAD_Z = 50;

    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const sizes     = new Float32Array(COUNT);

    const colorGreen = new THREE.Color('#22c55e');
    const colorWhite = new THREE.Color('#ffffff');
    const colorDimGreen = new THREE.Color('#16a34a');

    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);

      positions[i * 3]     = (col / (COLS - 1) - 0.5) * SPREAD_X;
      positions[i * 3 + 1] = 0; // Y set per frame
      positions[i * 3 + 2] = (row / (ROWS - 1) - 0.5) * SPREAD_Z;

      // Color distribution: 60% green variants, 40% white
      const rand = Math.random();
      let c;
      if (rand < 0.45) {
        c = colorGreen;
      } else if (rand < 0.65) {
        c = colorDimGreen;
      } else {
        c = colorWhite;
      }
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = 0.06 + Math.random() * 0.12;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    // Round glowing particle shader
    const material = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (320.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, dist);
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }
      `,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ── Mouse parallax ───────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── Resize handler ───────────────────────────────────
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ── Animation loop ───────────────────────────────────
    let frameId;
    const posAttr = geometry.attributes.position;

    const animate = (t) => {
      frameId = requestAnimationFrame(animate);
      const time = t * 0.0005;

      for (let i = 0; i < COUNT; i++) {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x   = (col / (COLS - 1) - 0.5) * SPREAD_X;
        const z   = (row / (ROWS - 1) - 0.5) * SPREAD_Z;

        // Layered sine waves
        const y =
          Math.sin(x * 0.25 + time * 1.2) * 1.4 +
          Math.sin(z * 0.3  + time * 0.9) * 1.0 +
          Math.sin((x + z) * 0.18 + time * 0.7) * 0.7;

        posAttr.array[i * 3 + 1] = y;
      }
      posAttr.needsUpdate = true;

      // Gentle camera parallax follow
      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      // Slow rotation
      particles.rotation.y = time * 0.05;

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    // ── Cleanup ──────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
