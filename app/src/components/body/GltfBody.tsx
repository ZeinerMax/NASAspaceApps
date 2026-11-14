// Swap-in stub for a real 3D model (PLAN.md §6.1). NOT used by default.
// How to use: export a .glb whose mesh names equal the RegionIds (head, chest, abdomen, arms, legs, body),
// put it in public/models/body.glb, and in BodyScene.tsx replace <StylizedBody …/> with <GltfBody …/>.
// Only use a model with a licence that allows it (CC0 / CC-BY) and record the licence in README.md.
import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { RegionId } from '../../types';
import { STATUS_COLOR } from '../common';
import type { BodyModelProps } from './StylizedBody';

const REGION_IDS: RegionId[] = ['head', 'chest', 'abdomen', 'arms', 'legs', 'body'];

export default function GltfBody({ regionStatus, onSelect, url = 'models/body.glb' }: BodyModelProps & { url?: string }) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const region = REGION_IDS.find((r) => mesh.name.toLowerCase().startsWith(r));
      if (!region) return;
      const c = new THREE.Color(STATUS_COLOR[regionStatus[region]]);
      mesh.material = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.4, transparent: true, opacity: 0.85 });
      mesh.userData.region = region;
    });
  }, [root, regionStatus]);

  return (
    <primitive
      object={root}
      onClick={(e: { object: THREE.Object3D; stopPropagation: () => void }) => {
        e.stopPropagation();
        const r = e.object.userData.region as RegionId | undefined;
        if (r) onSelect(r);
      }}
    />
  );
}
