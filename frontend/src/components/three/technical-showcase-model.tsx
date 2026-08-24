"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Html, OrbitControls } from "@react-three/drei";
import type { ReactNode } from "react";
import type { Group } from "three";

function CompressorAssembly() {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.18;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.14} floatIntensity={0.18}>
      <group ref={groupRef} rotation={[0.08, -0.35, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[2.4, 1.25, 1.2]} />
          <meshStandardMaterial color="#dbeafe" metalness={0.28} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.15, 0.64]}>
          <boxGeometry args={[2.12, 0.92, 0.08]} />
          <meshStandardMaterial color="#0b1b33" metalness={0.42} roughness={0.18} />
        </mesh>
        {[-0.68, 0, 0.68].map((x) => (
          <mesh key={x} position={[x, -0.15, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.025, 12, 36]} />
            <meshStandardMaterial color="#e8c46a" metalness={0.55} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[-0.72, 0.72, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.74, 36]} />
          <meshStandardMaterial color="#2b6bf0" metalness={0.48} roughness={0.24} />
        </mesh>
        <mesh position={[0.72, 0.65, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 1.18, 32]} />
          <meshStandardMaterial color="#8ab5ff" metalness={0.5} roughness={0.22} />
        </mesh>
        <mesh position={[0, -0.85, 0]}>
          <boxGeometry args={[2.8, 0.18, 1.45]} />
          <meshStandardMaterial color="#122a4d" metalness={0.45} roughness={0.28} />
        </mesh>
        <Html position={[-1.42, 0.62, 0.08]} center className="pointer-events-none">
          <Label>Compressor</Label>
        </Html>
        <Html position={[1.48, 0.48, 0.04]} center className="pointer-events-none">
          <Label>Condenser</Label>
        </Html>
        <Html position={[0.04, -0.08, 0.98]} center className="pointer-events-none">
          <Label>Fan</Label>
        </Html>
      </group>
    </Float>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-brand-100 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700 shadow-lg shadow-navy-900/10 backdrop-blur">
      {children}
    </span>
  );
}

export default function TechnicalShowcaseModel() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 1.2, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 5, 5]} intensity={1.25} color="#ffffff" />
      <directionalLight position={[-4, 1, -2]} intensity={0.45} color="#8ab5ff" />
      <CompressorAssembly />
      <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={4.4} blur={2.4} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.45} />
    </Canvas>
  );
}
