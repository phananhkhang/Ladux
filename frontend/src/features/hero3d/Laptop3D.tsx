/**
 * Laptop3D — Procedurally-modeled laptop using R3F primitives.
 * --------------------------------------------------------------
 * Geometry convention:
 *   +Y = up,  +Z = toward camera,  +X = to the right
 *
 * Base: horizontal slab, keyboard deck on top (+Y face).
 * Lid:  pivots at the back edge of the base (z = back). When opened
 *       by ~110° (negative X-rotation), the screen face — modeled
 *       on the −Y side of the lid panel in CLOSED state — rotates
 *       up and forward, ending facing the camera.
 *
 * If you later have a real laptop .glb, swap the body for:
 *   const { scene } = useGLTF("/models/laptop.glb");
 *   return <primitive object={scene} scale={...} />;
 */
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";

const SILVER = "#787c83";
const SILVER_EDGE = "#4d5158";
const FRAME = "#0a0a0c";
const KEYBOARD = "#040406";
const KEY = "#3a3a3f";

interface Laptop3DProps {
  scale?: number;
}

export default function Laptop3D({ scale = 1 }: Laptop3DProps) {
  const group = useRef<Group>(null);

  // Gentle floating bob on top of OrbitControls' auto-rotate
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = -0.15 + Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
  });

  // Lid open angle (negative → lifts up and toward back).
  // -1.85 rad ≈ -106° (typical viewing angle, screen tilts slightly back).
  const lidAngle = -1.88;

  return (
    <group ref={group} scale={scale} rotation={[0.04, 0, 0]}>
      {/* ============ BASE (keyboard deck) ============ */}
      <group>
        {/* Bottom chassis */}
        <RoundedBox args={[3.4, 0.18, 2.3]} radius={0.06} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color={SILVER} metalness={0.45} roughness={0.55} />
        </RoundedBox>

        {/* Underside bevel */}
        <RoundedBox args={[3.36, 0.04, 2.26]} radius={0.04} smoothness={4} position={[0, -0.09, 0]}>
          <meshStandardMaterial color={SILVER_EDGE} metalness={0.5} roughness={0.6} />
        </RoundedBox>

        {/* Top deck (keyboard surface) */}
        <RoundedBox args={[3.36, 0.02, 2.26]} radius={0.05} smoothness={4} position={[0, 0.1, 0]}>
          <meshStandardMaterial color={SILVER} metalness={0.45} roughness={0.5} />
        </RoundedBox>

        {/* Keyboard recess (dark cutout) */}
        <RoundedBox
          args={[2.92, 0.005, 1.04]}
          radius={0.03}
          smoothness={4}
          position={[0, 0.112, -0.32]}
        >
          <meshStandardMaterial color={KEYBOARD} metalness={0.35} roughness={0.78} />
        </RoundedBox>

        {/* Keys */}
        <Keys rows={5} cols={14} originX={-1.27} originZ={-0.7} stepX={0.19} stepZ={0.18} />

        {/* Trackpad */}
        <RoundedBox args={[1.25, 0.01, 0.82]} radius={0.05} smoothness={4} position={[0, 0.115, 0.55]}>
          <meshStandardMaterial color="#76797f" metalness={0.55} roughness={0.5} />
        </RoundedBox>
      </group>

      {/* ============ LID / SCREEN ============
          Pivot is at the BACK edge of the base (world z ≈ -1.15).
          The lid panel is placed +Z forward from the pivot so that,
          when CLOSED (rotation=0), the lid lies flat on top of the base.
          When the lid rotates by ≈ -106° around X, the lid lifts up
          and tilts slightly toward the back.
          The SCREEN side is modeled at −Y of the lid panel so that, after
          rotation, it ends up facing the camera (+Z). */}
      <group position={[0, 0.18, -1.13]} rotation={[lidAngle, 0, 0]}>
        {/* The lid is centered +1.1 forward of the pivot so it covers the
            keyboard area when flat. */}
        <group position={[0, 0, 1.1]}>
          {/* Lid outer back panel */}
          <RoundedBox args={[3.4, 0.06, 2.2]} radius={0.06} smoothness={4} castShadow>
            <meshStandardMaterial color={SILVER} metalness={0.5} roughness={0.5} />
          </RoundedBox>

          {/* Bezel frame on the FRONT of the lid (i.e. -Y in closed state).
              After lid rotation this is what faces the camera. */}
          <RoundedBox
            args={[3.32, 0.01, 2.14]}
            radius={0.05}
            smoothness={4}
            position={[0, -0.035, 0]}
          >
            <meshStandardMaterial color={FRAME} metalness={0.35} roughness={0.65} />
          </RoundedBox>

          {/* Display panel — emissive subtle green glow */}
          <mesh position={[0, -0.041, 0]} castShadow>
            <boxGeometry args={[3.04, 0.005, 1.86]} />
            <meshStandardMaterial
              color="#060708"
              emissive="#00ff66"
              emissiveIntensity={0.35}
              metalness={0.1}
              roughness={0.4}
            />
          </mesh>

          {/* Glowing AURATECH logo cutout on the OUTSIDE back of the lid
              (visible when you orbit around to the back) */}
          <mesh position={[0, 0.034, 0]}>
            <circleGeometry args={[0.18, 32]} />
            <meshStandardMaterial
              color="#00ff66"
              emissive="#00ff66"
              emissiveIntensity={0.55}
              toneMapped={false}
            />
          </mesh>

          {/* Camera notch on the bezel */}
          <mesh position={[0, -0.042, -0.96]}>
            <circleGeometry args={[0.025, 16]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.7} />
          </mesh>
        </group>

        {/* Hinge cylinder (at the pivot) */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 3.4, 24]} />
          <meshStandardMaterial color={FRAME} metalness={0.7} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- Keys ---------- */
interface KeysProps {
  rows: number;
  cols: number;
  originX: number;
  originZ: number;
  stepX: number;
  stepZ: number;
}

function Keys({ rows, cols, originX, originZ, stepX, stepZ }: KeysProps) {
  const keys: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = originX + c * stepX;
      const z = originZ + r * stepZ;
      keys.push(
        <mesh key={`${r}-${c}`} position={[x, 0.138, z]} castShadow>
          <boxGeometry args={[0.155, 0.04, 0.155]} />
          <meshStandardMaterial color={KEY} metalness={0.2} roughness={0.82} />
        </mesh>
      );
    }
  }
  return <group>{keys}</group>;
}
