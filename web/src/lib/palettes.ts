/**
 * Color palettes for mapping iteration counts to RGBA.
 */

export type Palette = (iter: number, maxIter: number) => [number, number, number, number];

/** Classic blue-black palette */
export const classic: Palette = (iter, maxIter) => {
  if (iter >= maxIter) return [0, 0, 0, 255];
  const t = iter / maxIter;
  const r = Math.floor(9 * (1 - t) * t * t * t * 255);
  const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
  const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
  return [r, g, b, 255];
};

/** Inferno-inspired palette */
export const inferno: Palette = (iter, maxIter) => {
  if (iter >= maxIter) return [0, 0, 0, 255];
  const t = iter / maxIter;
  const r = Math.floor(255 * Math.min(1, 1.5 * t));
  const g = Math.floor(255 * Math.pow(t, 3));
  const b = Math.floor(255 * Math.sin(t * Math.PI));
  return [r, g, b, 255];
};

/** Viridis-inspired palette */
export const viridis: Palette = (iter, maxIter) => {
  if (iter >= maxIter) return [0, 0, 0, 255];
  const t = iter / maxIter;
  const r = Math.floor(255 * (0.267 + 0.004 * t + t * t * 0.3));
  const g = Math.floor(255 * (0.004 + t * 0.87));
  const b = Math.floor(255 * (0.329 + 0.42 * t - 0.4 * t * t));
  return [r, g, b, 255];
};

/** Blue-Red heatmap for temperature grids */
export function heatColor(value: number, min: number, max: number): [number, number, number, number] {
  const t = max === min ? 0.5 : (value - min) / (max - min);
  const r = Math.floor(255 * Math.min(1, 2 * t));
  const g = Math.floor(255 * (1 - Math.abs(2 * t - 1)));
  const b = Math.floor(255 * Math.min(1, 2 * (1 - t)));
  return [r, g, b, 255];
}

export const PALETTES = { classic, inferno, viridis } as const;
export type PaletteName = keyof typeof PALETTES;
