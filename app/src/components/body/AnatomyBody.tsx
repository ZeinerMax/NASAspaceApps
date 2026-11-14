// The anatomy image with colour overlays for problem regions (orange = warning, red = act now).
// Healthy regions stay uncoloured. No text is drawn by the app on the body.
// Positions come from bodyConfig.ts; the image files are used as they are.
import { useId, useMemo, useState } from 'react';
import type { RegionId, Status } from '../../types';
import { STATUS_COLOR } from '../common';
import { BODY_H, BODY_IMAGES, BODY_OVERLAYS, BODY_W, GAP_CLOSERS, HIT_ORDER, pointInPolygon, toPath, type Polygon } from './bodyConfig';
import { useSilhouette } from './silhouette';

const DEBUG = typeof location !== 'undefined' && /[?&]debug/.test(location.search);

export default function AnatomyBody({ sex, regionStatus, selected = null, onSelect, height = '100%' }: {
  sex: 'male' | 'female';
  regionStatus: Record<RegionId, Status>;
  selected?: RegionId | null;
  /** If set, regions are clickable. Without it the image is display-only. */
  onSelect?: (r: RegionId | null) => void;
  height?: string | number;
}) {
  const uid = useId().replace(/:/g, '');
  const src = BODY_IMAGES[sex];
  const cfg = BODY_OVERLAYS[sex];
  const sil = useSilhouette(src, GAP_CLOSERS[sex]);
  const [hover, setHover] = useState<RegionId | null>(null);

  const hitPolys = useMemo(() => {
    const m = {} as Record<RegionId, Polygon[]>;
    for (const r of HIT_ORDER) m[r] = [...(cfg[r].hit ?? []), ...(cfg[r].organs ?? []), ...(cfg[r].bands ?? [])];
    return m;
  }, [cfg]);

  const regionAt = (x: number, y: number): RegionId | null => {
    for (const r of HIT_ORDER) {
      if (r === 'body') continue;
      const isBand = !!cfg[r].bands;
      // bands are clipped to the silhouette (so empty space next to an arm is not clickable)
      if (hitPolys[r].some((p) => pointInPolygon(x, y, p)) && (!isBand || (sil?.inside(x, y) ?? true))) return r;
    }
    return sil?.inside(x, y) ? 'body' : null;
  };

  const toImage = (e: React.MouseEvent<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    return regionAt(((e.clientX - b.left) / b.width) * BODY_W, ((e.clientY - b.top) / b.height) * BODY_H);
  };

  const shapes = (r: RegionId, color: string, opts: { fillOpacity: number; stroke?: boolean; blur?: boolean }) => {
    const o = cfg[r];
    const common = { fill: color, fillOpacity: opts.fillOpacity, stroke: opts.stroke ? color : 'none', strokeWidth: 3, strokeLinejoin: 'round' as const };
    return (
      <>
        {o.organs?.map((p, i) => <path key={`o${i}`} d={toPath(p)} {...common} filter={opts.blur ? `url(#${uid}glow)` : undefined} />)}
        {sil && o.bands && (
          <g mask={`url(#${uid}sil)`}>
            {o.bands.map((p, i) => <path key={`b${i}`} d={toPath(p)} fill={color} fillOpacity={opts.fillOpacity} />)}
          </g>
        )}
        {sil && o.whole && opts.stroke && <image href={sil.alphaUrl} x={0} y={0} width={BODY_W} height={BODY_H} preserveAspectRatio="none" filter={`url(#${uid}ring-${color.slice(1)})`} />}
      </>
    );
  };

  const active = HIT_ORDER.filter((r) => regionStatus[r] === 'orange' || regionStatus[r] === 'red');
  // the whole-body tint goes underneath the organs
  const ordered = [...active.filter((r) => r === 'body'), ...active.filter((r) => r !== 'body')];

  return (
    <div style={{ position: 'relative', height, aspectRatio: `${BODY_W} / ${BODY_H}`, maxWidth: '100%', background: '#fff', borderRadius: 14, overflow: 'hidden', flex: 'none' }}>
      <img src={src} alt="Anatomy" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', userSelect: 'none' }} />
      <svg
        viewBox={`0 0 ${BODY_W} ${BODY_H}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: onSelect && hover ? 'pointer' : 'default' }}
        onMouseMove={onSelect ? (e) => setHover(toImage(e)) : undefined}
        onMouseLeave={onSelect ? () => setHover(null) : undefined}
        onClick={onSelect ? (e) => onSelect(toImage(e)) : undefined}
      >
        <defs>
          <filter id={`${uid}glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* whole-body status: glowing outline just outside the silhouette (one filter per colour) */}
          {[STATUS_COLOR.orange, STATUS_COLOR.red].map((c) => (
            <filter key={c} id={`${uid}ring-${c.slice(1)}`} filterUnits="userSpaceOnUse" x={0} y={0} width={BODY_W} height={BODY_H}>
              <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d" />
              <feComposite in="d" in2="SourceAlpha" operator="out" result="edge" />
              <feFlood floodColor={c} result="c" />
              <feComposite in="c" in2="edge" operator="in" result="ring" />
              <feGaussianBlur in="ring" stdDeviation="5" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="ring" /></feMerge>
            </filter>
          ))}
          {sil && (
            <mask id={`${uid}sil`} maskUnits="userSpaceOnUse" x={0} y={0} width={BODY_W} height={BODY_H}>
              <image href={sil.maskUrl} x={0} y={0} width={BODY_W} height={BODY_H} preserveAspectRatio="none" />
            </mask>
          )}
        </defs>

        {ordered.map((r) => (
          <g key={r} className={regionStatus[r] === 'red' ? 'anat-pulse' : undefined} style={{ mixBlendMode: 'multiply' }}>
            {shapes(r, STATUS_COLOR[regionStatus[r]], { fillOpacity: regionStatus[r] === 'red' ? 0.62 : 0.55, stroke: true, blur: true })}
          </g>
        ))}

        {/* hover / selection outline */}
        {onSelect && [hover, selected].filter((r, i, a): r is RegionId => !!r && a.indexOf(r) === i).map((r) => (
          <g key={`ring-${r}`} style={{ pointerEvents: 'none' }}>
            {shapes(r, '#101834', { fillOpacity: r === selected ? 0.1 : 0.06, stroke: true })}
          </g>
        ))}

        {DEBUG && sil && <image href={sil.alphaUrl} x={0} y={0} width={BODY_W} height={BODY_H} preserveAspectRatio="none" opacity={0.35} style={{ pointerEvents: 'none' }} />}
        {DEBUG && HIT_ORDER.flatMap((r) => hitPolys[r].map((p, i) => <path key={`${r}${i}`} d={toPath(p)} fill="none" stroke="#2a7de1" strokeWidth={2} />))}
      </svg>
    </div>
  );
}
