"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
function Block({
  pos,
  size,
  color = "#747779",
  metal = 0.25,
}: {
  pos: [number, number, number];
  size: [number, number, number];
  color?: string;
  metal?: number;
}) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.65} metalness={metal} />
    </mesh>
  );
}
function Architecture() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ pointer, clock }, delta) => {
    if (!group.current) return;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1);
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      -0.28 + pointer.x * 0.12 + scroll * 0.3,
      3,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      pointer.y * 0.025,
      3,
      delta,
    );
    group.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.025;
  });
  return (
    <group ref={group}>
      <Block pos={[0, -0.35, 0]} size={[9, 0.22, 6.6]} color="#363a3f" />
      <Block pos={[0, -0.19, 0]} size={[8.1, 0.1, 5.9]} color="#707375" />
      {/* A conceptual residence, not a representation of a listed MAD project. */}
      {[0, 1, 2].map((f) => (
        <group key={f} position={[0, f * 1.5, 0]}>
          <Block
            pos={[0, 0.68, 0.2]}
            size={[6.4, 1.4, 3.9]}
            color="#242c32"
            metal={0.65}
          />
          <Block pos={[0, 1.44, 0]} size={[7.2, 0.2, 4.8]} color="#9d9b93" />
          <Block pos={[0, 0.04, 2.3]} size={[7.2, 0.16, 0.4]} color="#999992" />
          {[-3.1, -1.7, -0.3, 1.1, 2.5, 3.1].map((x, i) => (
            <group key={i}>
              <Block
                pos={[x, 0.75, 2.18]}
                size={[0.065, 1.3, 0.065]}
                color="#82827d"
              />
              <Block
                pos={[x + 0.32, 0.71, 2.02]}
                size={[0.55, 1.1, 0.025]}
                color={i % 3 === 0 ? "#5f574b" : "#34424a"}
                metal={0.8}
              />
            </group>
          ))}
          <mesh position={[0, 1.32, 2.43]}>
            <boxGeometry args={[6.85, 0.026, 0.028]} />
            <meshStandardMaterial
              color="#7A1626"
              emissive="#ba253f"
              emissiveIntensity={2}
            />
          </mesh>
          <Block
            pos={[0, 0.45, 2.6]}
            size={[7, 0.035, 0.035]}
            color="#a4a4a0"
          />
          {[-3.4, -1.7, 0, 1.7, 3.4].map((x) => (
            <Block
              key={x}
              pos={[x, 0.25, 2.6]}
              size={[0.025, 0.4, 0.025]}
              color="#999b98"
            />
          ))}
        </group>
      ))}
      <Block
        pos={[-2.58, 2.16, 2.28]}
        size={[1.03, 4.55, 0.45]}
        color="#a4a19a"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <Block
          key={i}
          pos={[-3.55 + i * 0.115, 2.16, 2.62]}
          size={[0.045, 4.45, 0.16]}
          color="#666057"
        />
      ))}
      <Block pos={[1.45, 4.81, -0.4]} size={[3.6, 0.52, 3.5]} color="#7c7d79" />
      <Block pos={[1.45, 5.14, -0.4]} size={[4, 0.12, 3.9]} color="#aaa79f" />
      <Block pos={[3.3, 2.3, -1.5]} size={[0.3, 4.6, 1.2]} color="#8d8d86" />
      {[0, 1, 2, 3].map((i) => (
        <Block
          key={i}
          pos={[0.9, -0.05 + i * 0.05, 3 + i * -0.17]}
          size={[2.8, 0.08, 0.6]}
          color="#92918b"
        />
      ))}
      <Block pos={[-3.4, 0.13, 2.9]} size={[1.1, 0.45, 0.7]} color="#44484a" />
      {[-3.7, -3.35, -3].map((x) => (
        <mesh key={x} position={[x, 0.55, 2.9]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#39443a" />
        </mesh>
      ))}
      <Block pos={[3.4, 0.12, 2.9]} size={[0.65, 0.4, 0.65]} color="#44484a" />
      <mesh position={[3.4, 0.67, 2.9]}>
        <sphereGeometry args={[0.43, 10, 10]} />
        <meshStandardMaterial color="#3a473d" />
      </mesh>
    </group>
  );
}
export default function Building() {
  const [active, setActive] = useState(true);
  useEffect(() => {
    let inView = true;
    const update = () => setActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    const hero = document.querySelector(".hero");
    if (hero) observer.observe(hero);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [10, 7.7, 12.8], fov: 37 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ camera }) => camera.lookAt(0, 1.9, 0)}
    >
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#bbc6d1", "#303032", 1.8]} />
      <directionalLight
        position={[2, 10, 6]}
        intensity={3}
        color="#e1d5be"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 3, -4]} intensity={2} color="#778796" />
      <pointLight position={[3, 2, 4]} color="#8e1830" intensity={12} />
      <Architecture />
    </Canvas>
  );
}
