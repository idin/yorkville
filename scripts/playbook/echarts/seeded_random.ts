/**
 * Seeded random numbers for the made-up picture data, so every redraw gives
 * the same picture. Not the same stream as the Plotly script's NumPy: the
 * two sets show the same shapes, not identical points.
 */

/** A source of uniform numbers in [0, 1). */
export type RandomSource = () => number;

/**
 * Create a seeded uniform source (mulberry32: small, fast, good enough for pictures).
 *
 * @param seed - Any integer.
 * @returns The source.
 */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draw uniform numbers.
 *
 * @param random - The source.
 * @param options - The range and how many.
 * @returns The numbers.
 */
export function drawUniform(random: RandomSource, options: { low: number; high: number; count: number }): number[] {
  return Array.from({ length: options.count }, () => options.low + (options.high - options.low) * random());
}

/**
 * Draw normally distributed numbers (Box–Muller).
 *
 * @param random - The source.
 * @param options - The mean, standard deviation and how many.
 * @returns The numbers.
 */
export function drawNormal(random: RandomSource, options: { mean: number; deviation: number; count: number }): number[] {
  return Array.from({ length: options.count }, () => {
    const radius = Math.sqrt(-2 * Math.log(1 - random()));
    return options.mean + options.deviation * radius * Math.cos(2 * Math.PI * random());
  });
}

/**
 * Draw gamma-distributed numbers with a whole-number shape, as a sum of exponentials.
 *
 * @param random - The source.
 * @param options - The shape (a whole number), the scale and how many.
 * @returns The numbers.
 */
export function drawGamma(random: RandomSource, options: { shape: number; scale: number; count: number }): number[] {
  return Array.from({ length: options.count }, () => {
    let sum = 0;
    for (let index = 0; index < options.shape; index += 1) sum -= Math.log(1 - random());
    return sum * options.scale;
  });
}
