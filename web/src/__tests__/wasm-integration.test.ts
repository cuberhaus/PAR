/**
 * WASM integration tests.
 * These tests load the compiled WASM modules and verify the exported functions
 * produce correct results. Requires WASM modules to be built first (make wasm).
 *
 * Skip condition: tests are skipped if WASM files don't exist.
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';

const wasmDir = resolve(__dirname, '../../public/wasm');
const hasWasm = existsSync(resolve(wasmDir, 'pi.js'));

describe.skipIf(!hasWasm)('WASM Pi module', () => {
  it('compute_pi returns value close to pi', async () => {
    const factory = (await import('../../public/wasm/pi.js')).default;
    const mod = await factory();
    const pi = mod.ccall('compute_pi', 'number', ['number'], [1000000]);
    expect(Math.abs(pi - Math.PI)).toBeLessThan(1e-5);
  });

  it('compute_pi_slice sums to full pi', async () => {
    const factory = (await import('../../public/wasm/pi.js')).default;
    const mod = await factory();
    const steps = 100000;
    const half = Math.floor(steps / 2);
    const s1 = mod.ccall('compute_pi_slice', 'number', ['number', 'number', 'number'], [0, half, steps]);
    const s2 = mod.ccall('compute_pi_slice', 'number', ['number', 'number', 'number'], [half, steps, steps]);
    const total = s1 + s2;
    expect(Math.abs(total - Math.PI)).toBeLessThan(1e-4);
  });
});

describe.skipIf(!hasWasm)('WASM Solver module', () => {
  it('jacobi_step reduces residual', async () => {
    const factory = (await import('../../public/wasm/solver.js')).default;
    const mod = await factory();
    const n = 16;
    const uPtr = mod._malloc(n * n * 8);
    const unewPtr = mod._malloc(n * n * 8);
    mod.ccall('init_grid', null, ['number', 'number', 'number'], [uPtr, n, n]);
    mod.ccall('init_grid', null, ['number', 'number', 'number'], [unewPtr, n, n]);

    const r1 = mod.ccall('jacobi_step', 'number', ['number', 'number', 'number', 'number'], [uPtr, unewPtr, n, n]);
    mod.ccall('copy_mat', null, ['number', 'number', 'number', 'number'], [unewPtr, uPtr, n, n]);
    const r2 = mod.ccall('jacobi_step', 'number', ['number', 'number', 'number', 'number'], [uPtr, unewPtr, n, n]);

    expect(r1).toBeGreaterThan(0);
    expect(r2).toBeLessThan(r1);

    mod._free(uPtr);
    mod._free(unewPtr);
  });
});

describe.skipIf(!hasWasm)('WASM Multisort module', () => {
  it('sorts a small array correctly', async () => {
    const factory = (await import('../../public/wasm/multisort.js')).default;
    const mod = await factory();
    const n = 64;
    const dataPtr = mod._malloc(n * 4);
    const tmpPtr = mod._malloc(n * 4);

    mod.ccall('initialize', null, ['number', 'number'], [dataPtr, n]);
    const tmpView = new Int32Array(mod.HEAP32.buffer, tmpPtr, n);
    tmpView.fill(0);

    mod.ccall('multisort', null, ['number', 'number', 'number', 'number', 'number'], [dataPtr, tmpPtr, n, 16, 16]);
    const unsorted = mod.ccall('check_sorted', 'number', ['number', 'number'], [dataPtr, n]);
    expect(unsorted).toBe(0);

    mod._free(dataPtr);
    mod._free(tmpPtr);
  });
});
