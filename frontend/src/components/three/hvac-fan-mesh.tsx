"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function FanBlade() {
  const groupRef = useRef<Group>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * 0.35;
    groupRef.current.rotation.x += (pointer.y * 0.3 - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (pointer.x * 0.3 - groupRef.current.rotation.y) * 0.05;
  });

  return (
    <group
      ref={groupRef}
      onPointerMove={(e) => setPointer({ x: e.point.x, y: e.point.y })}
    >
      <mesh>
        <torusGeometry args={[1.05, 0.09, 16, 48]} />
        <meshStandardMaterial color="#2b6bf0" metalness={0.6} roughness={0.25} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          rotation={[0, 0, (i / 5) * Math.PI * 2]}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 0.55,
            Math.sin((i / 5) * Math.PI * 2) * 0.55,
            0,
          ]}
        >
          <boxGeometry args={[0.62, 0.16, 0.05]} />
          <meshStandardMaterial color="#e8c46a" metalness={0.4} roughness={0.35} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#0b1b33" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default function HvacFanMesh() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 4]} intensity={1.2} />
      <directionalLight position={[-3, -2, -2]} intensity={0.4} color="#8ab5ff" />
      <FanBlade />
    </Canvas>
  );
}
