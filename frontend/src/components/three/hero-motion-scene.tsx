"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import type { Group } from "three";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function useHeroScroll(disabled: boolean | null) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (disabled) return;

    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const viewport = window.innerHeight || 1;
        setProgress(clamp01(window.scrollY / (viewport * 0.95)));
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [disabled]);

  return progress;
}

function ServiceRig({
  scrollProgress,
  reducedMotion,
}: {
  scrollProgress: number;
  reducedMotion: boolean;
}) {
  const rigRef = useRef<Group>(null);
  const fanRef = useRef<Group>(null);
  const ringRefs = useRef<Array<Group | null>>([]);
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const angle = index * 1.87;
        const radius = 1.35 + (index % 5) * 0.17;
        return {
          id: index,
          x: Math.cos(angle) * radius,
          y: -0.72 + (index % 6) * 0.28,
          z: Math.sin(angle) * 0.42 - 0.25,
          scale: 0.035 + (index % 4) * 0.006,
        };
      }),
    []
  );

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;

    if (rigRef.current) {
      rigRef.current.rotation.y =
        -0.52 + scrollProgress * 0.9 + Math.sin(elapsed * 0.28) * 0.035;
      rigRef.current.rotation.x = 0.14 - scrollProgress * 0.18;
      rigRef.current.position.y =
        -0.08 + scrollProgress * 0.44 + Math.sin(elapsed * 0.42) * 0.035;
      rigRef.current.position.x = 0.18 + scrollProgress * 0.18;
    }

    if (fanRef.current && !reducedMotion) {
      fanRef.current.rotation.z -= delta * 2.8;
    }

    ringRefs.current.forEach((ring, index) => {
      if (!ring) return;
      const direction = index % 2 === 0 ? 1 : -1;
      ring.rotation.z = elapsed * 0.12 * direction + scrollProgress * (index + 1) * 0.5;
      ring.rotation.y = Math.sin(elapsed * 0.22 + index) * 0.12;
    });
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.1}
      rotationIntensity={reducedMotion ? 0 : 0.12}
      floatIntensity={reducedMotion ? 0 : 0.18}
    >
      <group ref={rigRef} position={[0.25, -0.08, 0]} scale={1.12}>
        <group ref={(node) => { ringRefs.current[0] = node; }} position={[0, 0, -0.25]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.65, 0.018, 12, 112]} />
            <meshBasicMaterial color="#8ab5ff" transparent opacity={0.44} />
          </mesh>
        </group>

        <group ref={(node) => { ringRefs.current[1] = node; }} position={[0.08, 0, -0.18]}>
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 7]}>
            <torusGeometry args={[1.1, 0.014, 12, 96]} />
            <meshBasicMaterial color="#e8c46a" transparent opacity={0.42} />
          </mesh>
        </group>

        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[2.35, 1.26, 0.28]} />
          <meshStandardMaterial
            color="#dbeafe"
            metalness={0.48}
            roughness={0.24}
            envMapIntensity={1.15}
          />
        </mesh>

        <mesh position={[0, 0, 0.17]} castShadow>
          <boxGeometry args={[2.1, 1.02, 0.08]} />
          <meshStandardMaterial
            color="#071224"
            metalness={0.58}
            roughness={0.2}
            envMapIntensity={1.2}
          />
        </mesh>

        <group ref={fanRef} position={[0, 0, 0.25]}>
          {Array.from({ length: 9 }).map((_, index) => (
            <mesh key={index} rotation={[0, 0, (index * Math.PI) / 4.5]} position={[0, 0, 0.03]}>
              <boxGeometry args={[0.92, 0.045, 0.045]} />
              <meshStandardMaterial color="#8ab5ff" metalness={0.65} roughness={0.18} />
            </mesh>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.47, 0.035, 16, 80]} />
            <meshStandardMaterial
              color="#e8c46a"
              metalness={0.62}
              roughness={0.18}
              envMapIntensity={1.4}
            />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.1, 24, 24]} />
            <meshStandardMaterial color="#ffffff" metalness={0.45} roughness={0.25} />
          </mesh>
        </group>

        {[-0.82, 0.82].map((x) => (
          <group key={x} position={[x, -0.82, 0.03]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.7, 32]} />
              <meshStandardMaterial color="#2b6bf0" metalness={0.52} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.43, 0]} castShadow>
              <boxGeometry args={[0.48, 0.12, 0.4]} />
              <meshStandardMaterial color="#122a4d" metalness={0.48} roughness={0.24} />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 0.82, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 2.15, 32]} />
          <meshStandardMaterial color="#e8c46a" metalness={0.58} roughness={0.2} />
        </mesh>

        {particles.map((particle) => (
          <mesh
            key={particle.id}
            position={[particle.x, particle.y, particle.z]}
            scale={particle.scale}
          >
            <sphereGeometry args={[1, 14, 14]} />
            <meshBasicMaterial
              color={particle.id % 3 === 0 ? "#e8c46a" : "#8ab5ff"}
              transparent
              opacity={0.72}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function HeroMotionScene() {
  const reducedMotion = useReducedMotion();
  const scrollProgress = useHeroScroll(reducedMotion);

  return (
    <div className="size-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.45, 5.7], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "default" }}
        onCreated={({ gl }) => {
          // Let the browser attempt to restore a lost context instead of
          // leaving the render loop to spin on "Context Lost" forever.
          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => event.preventDefault(),
            false
          );
        }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[3.5, 3.8, 4.5]}
          intensity={1.45}
          color="#ffffff"
        />
        <directionalLight position={[-4, 1.2, 1]} intensity={0.62} color="#8ab5ff" />
        <ServiceRig
          scrollProgress={scrollProgress}
          reducedMotion={Boolean(reducedMotion)}
        />
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 3, 4]} scale={[5, 2, 1]} color="#ffffff" />
          <Lightformer intensity={1.4} position={[-4, 0, 2]} scale={[2, 4, 1]} color="#8ab5ff" />
          <Lightformer intensity={1.1} position={[4, -1, 2]} scale={[3, 2, 1]} color="#e8c46a" />
        </Environment>
      </Canvas>
    </div>
  );
}
