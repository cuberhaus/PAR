/**
 * Thin wrapper around Emscripten ES6 modules.
 * Each WASM module exports a factory function; calling it returns a Module
 * with `ccall` / `cwrap` available.
 */

export interface EmModule {
  ccall: (name: string, returnType: string, argTypes: string[], args: unknown[]) => unknown;
  cwrap: (name: string, returnType: string, argTypes: string[]) => (...args: unknown[]) => unknown;
  _malloc: (bytes: number) => number;
  _free: (ptr: number) => void;
  HEAP8: Int8Array;
  HEAP16: Int16Array;
  HEAP32: Int32Array;
  HEAPU8: Uint8Array;
  HEAPU32: Uint32Array;
  HEAPF64: Float64Array;
}

type ModuleFactory = () => Promise<EmModule>;

const cache = new Map<string, Promise<EmModule>>();

export async function loadWasm(name: string): Promise<EmModule> {
  const existing = cache.get(name);
  if (existing) return existing;

  const promise = (async () => {
    const factory: ModuleFactory = (await import(`/wasm/${name}.js`)).default;
    return factory();
  })();

  cache.set(name, promise);
  return promise;
}

/**
 * Allocate typed array in WASM heap, run callback, then free.
 */
export function withIntBuffer(
  mod: EmModule,
  length: number,
  fn: (ptr: number, view: Int32Array) => void,
): Int32Array {
  const bytes = length * 4;
  const ptr = mod._malloc(bytes);
  const view = new Int32Array(mod.HEAP32.buffer, ptr, length);
  fn(ptr, view);
  const result = new Int32Array(view);      // copy out
  mod._free(ptr);
  return result;
}

export function withFloat64Buffer(
  mod: EmModule,
  length: number,
  fn: (ptr: number, view: Float64Array) => void,
): Float64Array {
  const bytes = length * 8;
  const ptr = mod._malloc(bytes);
  const view = new Float64Array(mod.HEAPF64.buffer, ptr, length);
  fn(ptr, view);
  const result = new Float64Array(view);    // copy out
  mod._free(ptr);
  return result;
}
