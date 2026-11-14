// 3D scene: lights, orbit controls, scan-line sweep, and the body model.
// To swap the model, replace <StylizedBody/> with <GltfBody/> (same props).
import { memo, Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { RegionId, Status } from '../../types';
import StylizedBody from './StylizedBody';

function BodyScene({ sex, regionStatus, selected = null, onSelect, interactive = true }: {
  sex: 'male' | 'female'; regionStatus: Record<RegionId, Status>; selected?: RegionId | null; onSelect?: (id: RegionId | null) => void;
  /** false = display only (landing page): no clicking or dragging, slow auto-rotate. */
  interactive?: boolean;
}) {
  const [interacting, setInteracting] = useState(false);
  return (
    <Canvas
      camera={{ position: [0, 1.0, 4.7], fov: 36 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelect?.(null)}
      style={{ touchAction: 'none', pointerEvents: interactive ? 'auto' : 'none' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <gridHelper args={[6, 24, '#1d3a66', '#12244a']} position={[0, -0.36, 0]} />
      <pointLight position={[-3, 2, -2]} intensity={18} color="#7b6cff" />
      <pointLight position={[2, 0, 3]} intensity={10} color="#5ee7ff" />
      <Suspense fallback={null}>
        <group position={[0, -0.05, 0]}>
          <StylizedBody sex={sex} regionStatus={regionStatus} selected={selected} onSelect={(r) => onSelect?.(r)} />
        </group>
      </Suspense>
      <OrbitControls
        target={[0, 0.8, 0]}
        enablePan={false}
        enableRotate={interactive}
        enableZoom={interactive}
        minDistance={2.4}
        maxDistance={6}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.62}
        autoRotate={!interacting && !selected}
        autoRotateSpeed={0.8}
        onStart={() => setInteracting(true)}
        onEnd={() => setTimeout(() => setInteracting(false), 2500)}
      />
    </Canvas>
  );
}

export default memo(BodyScene);
