// Stylised "hologram" body built from primitives (no third-party model, no licence needed).
// Implements BodyModelProps so it can be swapped for GltfBody (see BodyScene.tsx / PLAN.md §6.1).
import { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { RegionId, Status } from '../../types';
import { STATUS_COLOR } from '../common';

export interface BodyModelProps {
  sex: 'male' | 'female';
  regionStatus: Record<RegionId, Status>;
  selected: RegionId | null;
  onSelect: (id: RegionId) => void;
}

const PULSE: Record<Status, [number, number]> = { red: [5.5, 0.55], orange: [2.6, 0.28], green: [0, 0], grey: [0, 0], info: [0, 0] };

/** Material that eases toward the status colour and pulses for orange/red. */
function useRegionMaterial(status: Status, active: boolean) {
  // Start at the status colour so the first frame is already correct; later changes ease in.
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: STATUS_COLOR[status], emissive: STATUS_COLOR[status], emissiveIntensity: 0.4,
      transparent: true, opacity: 0.82, roughness: 0.35, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.3,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const target = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }, dt) => {
    target.set(STATUS_COLOR[status]);
    mat.color.lerp(target, Math.min(1, dt * 4));
    mat.emissive.lerp(target, Math.min(1, dt * 4));
    const [speed, amp] = PULSE[status];
    const base = status === 'grey' ? 0.12 : 0.38;
    mat.emissiveIntensity = base + (active ? 0.45 : 0) + amp * (0.5 + 0.5 * Math.sin(clock.elapsedTime * speed));
    mat.opacity = status === 'grey' ? 0.55 : 0.82;
  });
  return mat;
}

function Region({ id, status, selected, onSelect, children }: {
  id: RegionId; status: Status; selected: boolean; onSelect: (id: RegionId) => void;
  children: (mat: THREE.Material, handlers: object) => React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const mat = useRegionMaterial(status, hover || selected);
  const handlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; },
    onPointerOut: () => { setHover(false); document.body.style.cursor = ''; },
    onClick: (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(id); },
  };
  return (
    <group>
      {children(mat, handlers)}
    </group>
  );
}

export default function StylizedBody({ sex, regionStatus, selected, onSelect }: BodyModelProps) {
  const sh = sex === 'female' ? 0.88 : 1; // shoulder width
  const hip = sex === 'female' ? 1.1 : 1; // hip width
  const h = sex === 'female' ? 0.96 : 1; // height
  const auraRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const auraMat = useMemo(() => new THREE.MeshBasicMaterial({ color: STATUS_COLOR[regionStatus.body], opacity: 0.12, transparent: true, depthWrite: false, side: THREE.BackSide }), []);
  const ringMat = useRegionMaterial(regionStatus.body, selected === 'body');

  useFrame(({ clock }, dt) => {
    auraMat.color.lerp(new THREE.Color(STATUS_COLOR[regionStatus.body]), Math.min(1, dt * 4));
    const [speed, amp] = PULSE[regionStatus.body];
    auraMat.opacity = 0.1 + 0.05 * Math.sin(clock.elapsedTime * 2) + amp * 0.12 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * speed));
  });

  const R = (id: RegionId) => ({ id, status: regionStatus[id], selected: selected === id, onSelect });

  return (
    <group scale={[1, h, 1]}>
      {/* HEAD (+ neck) */}
      <Region {...R('head')}>
        {(m, ev) => (
          <>
            <mesh position={[0, 1.68, 0]} scale={[0.9, 1.05, 0.95]} material={m} {...ev}><sphereGeometry args={[0.2, 40, 40]} /></mesh>
            <mesh position={[0, 1.46, 0]} material={m} {...ev}><cylinderGeometry args={[0.07, 0.085, 0.14, 20]} /></mesh>
          </>
        )}
      </Region>
      {/* CHEST */}
      <Region {...R('chest')}>
        {(m, ev) => <RoundedBox args={[0.58 * sh, 0.44, 0.28]} radius={0.11} smoothness={6} position={[0, 1.18, 0]} material={m} {...ev} />}
      </Region>
      {/* ABDOMEN */}
      <Region {...R('abdomen')}>
        {(m, ev) => <RoundedBox args={[0.46 * hip, 0.36, 0.26]} radius={0.1} smoothness={6} position={[0, 0.79, 0]} material={m} {...ev} />}
      </Region>
      {/* ARMS */}
      <Region {...R('arms')}>
        {(m, ev) => (
          <>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * (0.29 * sh + 0.1), 1.0, 0]} rotation={[0, 0, s * 0.1]} material={m} {...ev}>
                <capsuleGeometry args={[0.068, 0.64, 8, 20]} />
              </mesh>
            ))}
          </>
        )}
      </Region>
      {/* LEGS */}
      <Region {...R('legs')}>
        {(m, ev) => (
          <>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.12 * hip, 0.2, 0]} material={m} {...ev}>
                <capsuleGeometry args={[0.092, 0.7, 8, 20]} />
              </mesh>
            ))}
          </>
        )}
      </Region>
      {/* WHOLE BODY: glowing aura (not clickable) + scan platform ring (clickable) */}
      <mesh ref={auraRef} position={[0, 0.95, 0]} scale={[0.62 * sh, 1.25, 0.32]} raycast={() => null} material={auraMat}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      <Region {...R('body')}>
        {(m, ev) => (
          <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m} {...ev}>
            <torusGeometry args={[0.55, 0.035, 16, 80]} />
          </mesh>
        )}
      </Region>
      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null} material={ringMat}>
        <ringGeometry args={[0.6, 0.62, 80]} />
      </mesh>
    </group>
  );
}
