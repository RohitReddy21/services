"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Html,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import type { ReactNode } from "react";
import type { Group, Mesh } from "three";

function CompressorAssembly() {
  const groupRef = useRef<Group>(null);
  const scanRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
    }
    if (scanRef.current) {
      const t = (state.clock.elapsedTime * 0.5) % 2;
      scanRef.current.position.y = -0.9 + t;
      const mat = scanRef.current.material as { opacity: number };
      mat.opacity = 0.5 * (1 - Math.abs(t - 1));
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.14} floatIntensity={0.18}>
      <group ref={groupRef} rotation={[0.08, -0.35, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[2.4, 1.25, 1.2]} />
          <meshStandardMaterial
            color="#dbeafe"
            metalness={0.4}
            roughness={0.28}
            envMapIntensity={1.1}
          />
        </mesh>
        <mesh position={[0, -0.15, 0.64]}>
          <boxGeometry args={[2.12, 0.92, 0.08]} />
          <meshStandardMaterial
            color="#0b1b33"
            metalness={0.5}
            roughness={0.16}
            envMapIntensity={1.2}
          />
        </mesh>
        {[-0.68, 0, 0.68].map((x) => (
          <mesh key={x} position={[x, -0.15, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.025, 12, 36]} />
            <meshStandardMaterial
              color="#e8c46a"
              metalness={0.6}
              roughness={0.22}
              envMapIntensity={1.3}
            />
          </mesh>
        ))}
        <mesh position={[-0.72, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.74, 36]} />
          <meshStandardMaterial
            color="#2b6bf0"
            metalness={0.55}
            roughness={0.2}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh position={[0.72, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1.18, 32]} />
          <meshStandardMaterial
            color="#8ab5ff"
            metalness={0.55}
            roughness={0.2}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh position={[0, -0.85, 0]} receiveShadow>
          <boxGeometry args={[2.8, 0.18, 1.45]} />
          <meshStandardMaterial color="#122a4d" metalness={0.5} roughness={0.26} />
        </mesh>

        {/* Sweeping inspection scan-line */}
        <mesh ref={scanRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.012, 8, 64]} />
          <meshBasicMaterial color="#5390ff" transparent opacity={0.4} />
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
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.2, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => event.preventDefault(),
          false
        );
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 5, 5]}
        intensity={1.35}
        color="#ffffff"
      />
      <directionalLight position={[-4, 1, -2]} intensity={0.45} color="#8ab5ff" />
      <CompressorAssembly />
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.24}
        scale={4.4}
        blur={2.4}
      />
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 3, 4]} scale={[5, 2, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-4, 0, 2]} scale={[2, 4, 1]} color="#8ab5ff" />
        <Lightformer intensity={1} position={[4, -1, 2]} scale={[3, 2, 1]} color="#e8c46a" />
      </Environment>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.45}
      />
    </Canvas>
  );
}
