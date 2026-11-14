// 3D scene: lights, orbit controls, scan-line sweep, and the body model.
// To swap the model, replace <StylizedBody/> with <GltfBody/> (same props).
import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RegionId, Status } from '../../types';
import StylizedBody from './StylizedBody';

/** Horizontal light plane that sweeps down the body whenever `scanKey` changes. */
function ScanSweep({ scanKey }: { scanKey: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const start = useRef<number | null>(null);
  useEffect(() => { start.current = null; }, [scanKey]);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    if (start.current == null) start.current = clock.elapsedTime;
    const t = (clock.elapsedTime - start.current) / 1.8;
    m.visible = t < 1;
    m.position.y = 2.05 - t * 2.4;
    (m.material as THREE.MeshBasicMaterial).opacity = 0.35 * Math.sin(Math.PI * Math.min(1, t));
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <circleGeometry args={[0.75, 64]} />
      <meshBasicMaterial color="#5ee7ff" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export default function BodyScene({ sex, regionStatus, selected, onSelect, scanKey }: {
  sex: 'male' | 'female'; regionStatus: Record<RegionId, Status>; selected: RegionId | null; onSelect: (id: RegionId | null) => void; scanKey: string;
}) {
  const [interacting, setInteracting] = useState(false);
  return (
    <Canvas
      camera={{ position: [0, 1.0, 4.1], fov: 36 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelect(null)}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <gridHelper args={[6, 24, '#1d3a66', '#12244a']} position={[0, -0.36, 0]} />
      <pointLight position={[-3, 2, -2]} intensity={18} color="#7b6cff" />
      <pointLight position={[2, 0, 3]} intensity={10} color="#5ee7ff" />
      <Suspense fallback={null}>
        <group position={[0, -0.05, 0]}>
          <StylizedBody sex={sex} regionStatus={regionStatus} selected={selected} onSelect={onSelect} />
          <ScanSweep scanKey={scanKey} />
        </group>
      </Suspense>
      <OrbitControls
        target={[0, 0.85, 0]}
        enablePan={false}
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
