// Computes the body silhouette from the anatomy image itself (the image file is never changed).
// Method: flood-fill the white background from the image border; everything the fill cannot reach is "body".
// Thin lines and text (leader lines, labels) are removed by a small morphological opening and by keeping
// only the largest connected shape. The result is a black/white mask used to clip the arm / leg / whole-body highlights.
import { useEffect, useState } from 'react';
import { BODY_H, BODY_W, type Pt } from './bodyConfig';

export interface Silhouette {
  /** PNG data URL: white = body, black = outside. */
  maskUrl: string;
  /** PNG data URL: white body on a transparent background (for the whole-body outline). */
  alphaUrl: string;
  /** Is the point (in 931×2000 image coordinates) inside the body? */
  inside: (x: number, y: number) => boolean;
}

const W = 466; // working resolution (half of the overlay space)
const H = 1000;
const cache = new Map<string, Promise<Silhouette>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Box filter on a binary array: erode (min) or dilate (max) with radius r, separable. */
function boxFilter(src: Uint8Array, r: number, mode: 'min' | 'max'): Uint8Array {
  const tmp = new Uint8Array(src.length);
  const out = new Uint8Array(src.length);
  const hit = mode === 'max' ? 1 : 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = hit ^ 1;
      for (let k = -r; k <= r && v !== hit; k++) {
        const xx = x + k;
        const s = xx < 0 || xx >= W ? (mode === 'min' ? 0 : 0) : src[y * W + xx];
        if (s === hit) v = hit;
      }
      tmp[y * W + x] = v;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = hit ^ 1;
      for (let k = -r; k <= r && v !== hit; k++) {
        const yy = y + k;
        const s = yy < 0 || yy >= H ? 0 : tmp[yy * W + x];
        if (s === hit) v = hit;
      }
      out[y * W + x] = v;
    }
  }
  return out;
}

async function build(src: string, closers: [Pt, Pt][]): Promise<Silhouette> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  // close known gaps in the drawing (working canvas only)
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const [[x1, y1], [x2, y2]] of closers) {
    ctx.beginPath();
    ctx.moveTo((x1 / BODY_W) * W, (y1 / BODY_H) * H);
    ctx.lineTo((x2 / BODY_W) * W, (y2 / BODY_H) * H);
    ctx.stroke();
  }
  const px = ctx.getImageData(0, 0, W, H).data;

  // 1. line pixels are barriers. Thin lines turn light grey at this resolution and the female drawing has tiny breaks
  //    in them, so the threshold is generous and the lines are thickened by GROW px (closes gaps up to 2×GROW px).
  //    The extra thickness is removed again in step 3.
  const GROW = 3;
  const dark = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) dark[i] = px[i * 4 + 1] < 225 ? 1 : 0;
  const barrier = boxFilter(dark, GROW, 'max');

  // 2. flood fill the outside from the border
  const outside = new Uint8Array(W * H);
  const stack: number[] = [];
  const push = (i: number) => { if (!barrier[i] && !outside[i]) { outside[i] = 1; stack.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % W, y = (i / W) | 0;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (y > 0) push(i - W);
    if (y < H - 1) push(i + W);
  }

  // 3. body candidates = not outside. Shrink by GROW+1 (back to the real outline, and removes the thickened leader
  //    lines and text), then grow by 1.
  let body = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) body[i] = outside[i] ? 0 : 1;
  body = boxFilter(boxFilter(body, GROW + 1, 'min'), 1, 'max');

  // 4. keep only the largest connected shape
  const label = new Int32Array(W * H);
  let best = 0, bestSize = 0, next = 1;
  for (let s = 0; s < W * H; s++) {
    if (!body[s] || label[s]) continue;
    let size = 0;
    label[s] = next;
    stack.push(s);
    while (stack.length) {
      const i = stack.pop()!;
      size++;
      const x = i % W, y = (i / W) | 0;
      const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1];
      for (const j of nb) if (j >= 0 && body[j] && !label[j]) { label[j] = next; stack.push(j); }
    }
    if (size > bestSize) { bestSize = size; best = next; }
    next++;
  }
  const mask = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) mask[i] = label[i] === best ? 1 : 0;

  // 5. draw the mask
  const out = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const v = mask[i] ? 255 : 0;
    out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = v;
    out.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  const maskUrl = canvas.toDataURL('image/png');
  for (let i = 0; i < W * H; i++) out.data[i * 4 + 3] = mask[i] ? 255 : 0;
  ctx.putImageData(out, 0, 0);

  return {
    maskUrl,
    alphaUrl: canvas.toDataURL('image/png'),
    inside: (x, y) => {
      const ix = Math.floor((x / BODY_W) * W), iy = Math.floor((y / BODY_H) * H);
      return ix >= 0 && iy >= 0 && ix < W && iy < H && mask[iy * W + ix] === 1;
    },
  };
}

export const getSilhouette = (src: string, closers: [Pt, Pt][] = []) => {
  let p = cache.get(src);
  if (!p) { p = build(src, closers); cache.set(src, p); }
  return p;
};

export function useSilhouette(src: string, closers: [Pt, Pt][] = []): Silhouette | null {
  const [sil, setSil] = useState<Silhouette | null>(null);
  useEffect(() => {
    let alive = true;
    setSil(null);
    getSilhouette(src, closers).then((s) => alive && setSil(s)).catch(() => undefined);
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  return sil;
}
