// ALL body-image positions live in this file. To adjust an overlay, edit the numbers here.
//
// Coordinates are in the space of the anatomy images: 931 wide × 2000 high (x to the right, y down).
// Both images are 1408×3026 px, so the same coordinates work for both. Tip: open the app with
// `?debug` at the end of the address (e.g. http://localhost:5173/?debug#/F02/details) to see every shape outlined.
//
// Region → what is highlighted:
//   organs  = polygons drawn on the organ itself (brain, heart, lung, liver/stomach, intestines)
//   bands   = areas that are cut out of the body silhouette (arms, legs). The silhouette is computed from the image,
//             so the highlight follows the real outline exactly; the band only says WHERE (which part of the body).
//   whole   = the whole silhouette (used for the "whole body" region: temperature, infection, fatigue)
//   hit     = extra clickable area (bigger than the organ, so it is easy to click)
import type { RegionId } from '../../types';

export type Pt = [number, number];
export type Polygon = Pt[];

export const BODY_W = 931;
export const BODY_H = 2000;

export const BODY_IMAGES = { male: 'body/male.jpg', female: 'body/female.jpg' } as const;

export interface RegionOverlay {
  organs?: Polygon[];
  bands?: Polygon[];
  whole?: boolean;
  hit?: Polygon[];
}

/** Mirror a polygon around a vertical axis (to make the right arm from the left arm). */
const mirror = (poly: Polygon, axisX: number): Polygon => poly.map(([x, y]) => [2 * axisX - x, y] as Pt);
const rect = (x1: number, y1: number, x2: number, y2: number): Polygon => [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 28): Polygon =>
  Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((2 * Math.PI * i) / n), cy + ry * Math.sin((2 * Math.PI * i) / n)] as Pt);

// ---- organs (identical in both images) ----
const BRAIN: Polygon = [[426, 216], [442, 197], [460, 193], [474, 190], [492, 191], [508, 195], [524, 203], [534, 214], [542, 230], [547, 244], [546, 258], [540, 267],
  [532, 270], [534, 280], [528, 288], [516, 292], [506, 305], [501, 304], [488, 288], [478, 278], [464, 278], [454, 275], [442, 270], [432, 267], [420, 262], [413, 250], [415, 234], [420, 224]];

const HEART: Polygon = [[437, 552], [441, 534], [452, 529], [462, 536], [467, 521], [480, 518], [490, 518], [500, 521], [507, 536], [520, 547], [523, 556], [524, 578],
  [526, 610], [525, 641], [515, 658], [499, 661], [478, 654], [457, 641], [444, 626], [440, 612], [432, 592], [435, 575], [444, 566], [439, 556]];

const LUNG: Polygon = [[542, 502], [553, 505], [566, 516], [582, 540], [598, 566], [613, 597], [624, 636], [626, 662], [624, 684], [608, 700], [587, 693], [569, 685],
  [548, 680], [531, 665], [528, 640], [527, 600], [526, 570], [526, 540], [525, 520], [530, 508]];

const LIVER_STOMACH_PANCREAS: Polygon = [[349, 695], [414, 682], [498, 688], [548, 693], [574, 710], [586, 748], [599, 756], [599, 771], [578, 785], [565, 796], [548, 809],
  [515, 817], [494, 825], [456, 826], [439, 817], [427, 809], [406, 813], [376, 812], [357, 804], [349, 754]];

const INTESTINES: Polygon = [[370, 826], [393, 815], [416, 821], [439, 832], [469, 841], [498, 851], [527, 846], [548, 836], [561, 813], [580, 798], [587, 809], [587, 846],
  [588, 922], [580, 968], [565, 991], [540, 1002], [515, 1003], [492, 998], [489, 1040], [490, 1063], [477, 1067], [464, 1061], [458, 1031], [456, 983], [464, 973],
  [456, 964], [427, 964], [420, 981], [429, 995], [422, 993], [412, 974], [393, 979], [374, 974], [361, 943], [364, 897], [370, 859]];

// ---- arms: left arm is drawn, right arm is its mirror. Boundary follows the gap between arm and torso. ----
const armLeft = (apexX: number, apexY: number, lowX: number): Polygon => [[0, 430], [apexX, 430], [apexX, apexY], [lowX - 6, 900], [lowX, 1100], [lowX, 1200], [0, 1200]];

const LEGS: Polygon = rect(0, 1110, BODY_W, 1990);
const AXIS = { male: 467, female: 473 } as const;

function overlays(sex: 'male' | 'female'): Record<RegionId, RegionOverlay> {
  const axis = AXIS[sex];
  const left = sex === 'male' ? armLeft(300, 655, 288) : armLeft(327, 654, 280);
  return {
    head: { organs: [BRAIN], hit: [ellipse(480, 255, 88, 105)] },
    chest: { organs: [HEART, LUNG], hit: [rect(330, 470, 636, 690)] },
    abdomen: { organs: [LIVER_STOMACH_PANCREAS, INTESTINES], hit: [rect(345, 690, 615, 1080)] },
    arms: { bands: [left, mirror(left, axis)] },
    legs: { bands: [LEGS] },
    body: { whole: true },
  };
}

export const BODY_OVERLAYS = { male: overlays('male'), female: overlays('female') };

/**
 * Gaps in the drawings. The body outline is computed from the image; where the drawing has a hole in a line, the
 * highlight would leak. These short lines are added to the CALCULATION only (the image on screen is not changed).
 * Female image: the torso line on the right side starts too low and leaves a ~40 unit gap to the arm line.
 */
export const GAP_CLOSERS: Record<'male' | 'female', [Pt, Pt][]> = {
  male: [],
  female: [[[619, 846], [661, 822]]],
};

/** Hit-test order: first match wins. `body` (whole silhouette) is checked last. */
export const HIT_ORDER: RegionId[] = ['head', 'chest', 'abdomen', 'arms', 'legs', 'body'];

export const pointInPolygon = (x: number, y: number, poly: Polygon): boolean => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

export const toPath = (poly: Polygon) => 'M' + poly.map(([x, y]) => `${x} ${y}`).join(' L') + ' Z';
