// Unit conversions (standard conversions, not medical thresholds).

/** Glucose: 1 mmol/l = 18.0 mg/dL. */
export const mgDlToMmol = (mgDl: number) => mgDl / 18.0;

export const mlToL = (ml: number) => ml / 1000;

export const round = (v: number, digits = 1) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

export const fmt = (v: number | null | undefined, digits = 1, unit = '') =>
  v == null || Number.isNaN(v) ? '—' : `${v.toFixed(digits)}${unit ? ' ' + unit : ''}`;
