/**
 * Scene — wraps the R3F <Canvas/> with all the staging logic:
 *   • Camera + lights
 *   • Environment lighting (drei preset for realistic reflections)
 *   • OrbitControls with autoRotate + drag-to-rotate
 *   • Suspense fallback so the canvas never blocks the page
 *
 * The actual model (Laptop3D) is rendered as children — this keeps
 * lighting/controls logic separate from the model itself.
 */
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import Laptop3D from "./Laptop3D";

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      className="!touch-none"
      data-testid="hero3d-canvas"
    >
      {/* Camera — pulled back to comfortably frame the open laptop */}
      <PerspectiveCamera makeDefault position={[0, 1.8, 7.2]} fov={28} />

      {/* Lighting rig — low ambient + raking directional + hemisphere fill */}
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#9aa0aa", "#0a0a0c", 0.55]} />
      <directionalLight
        castShadow
        position={[2.5, 3.5, 3]}
        intensity={1.0}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
      />
      {/* Neon green rim light from behind */}
      <pointLight position={[-4, 2, -4]} intensity={2.6} color="#00ff66" distance={12} decay={2} />
      {/* Soft fill from camera side */}
      <pointLight position={[2.5, 1, 4]} intensity={0.65} color="#ffffff" distance={9} />

      <Suspense fallback={null}>
        <Laptop3D scale={1.05} />
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.6}
          scale={8}
          blur={2.4}
          far={2}
          color="#000000"
        />
      </Suspense>

      {/* OrbitControls — drag to rotate, auto-rotate when idle */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        dampingFactor={0.08}
        enableDamping
        makeDefault
      />
    </Canvas>
  );
}
