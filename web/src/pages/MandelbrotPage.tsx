import { useRef, useState, useCallback, useEffect } from 'preact/hooks';
import { loadWasm, type EmModule } from '../lib/wasm-loader';
import { PALETTES, type PaletteName, type Palette } from '../lib/palettes';

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 600;

export function MandelbrotPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mod, setMod] = useState<EmModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxIter, setMaxIter] = useState(256);
  const [palette, setPalette] = useState<PaletteName>('classic');
  const [workers, setWorkers] = useState(1);
  const [time, setTime] = useState(0);

  // View state for zoom/pan
  const [cx, setCx] = useState(0);
  const [cy, setCy] = useState(0);
  const [size, setSize] = useState(2);

  // Drag state
  const dragRef = useRef<{ startX: number; startY: number; cx0: number; cy0: number } | null>(null);

  useEffect(() => {
    loadWasm('mandel').then((m) => {
      setMod(m);
      setLoading(false);
    });
  }, []);

  const render = useCallback(() => {
    if (!mod || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const w = DEFAULT_WIDTH;
    const h = DEFAULT_HEIGHT;
    canvas.width = w;
    canvas.height = h;

    const t0 = performance.now();

    // Allocate buffer in WASM heap
    const bufSize = w * h * 4; // ints
    const ptr = mod._malloc(bufSize);

    mod.ccall(
      'compute_mandelbrot',
      'void',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number'],
      [ptr, w, h, maxIter, cx, cy, size],
    );

    // Read iteration counts
    const iterations = new Int32Array(mod.HEAP32.buffer, ptr, w * h);

    // Map to pixels
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const paletteFn: Palette = PALETTES[palette];

    for (let i = 0; i < w * h; i++) {
      const [r, g, b, a] = paletteFn(iterations[i], maxIter);
      const off = i * 4;
      data[off] = r;
      data[off + 1] = g;
      data[off + 2] = b;
      data[off + 3] = a;
    }

    mod._free(ptr);

    ctx.putImageData(imageData, 0, 0);
    setTime(performance.now() - t0);
  }, [mod, maxIter, cx, cy, size, palette]);

  // Re-render on param change
  useEffect(() => {
    if (mod) render();
  }, [mod, render]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.2 : 1 / 1.2;
      setSize((s) => s * factor);
    },
    [],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      dragRef.current = { startX: e.clientX, startY: e.clientY, cx0: cx, cy0: cy };
    },
    [cx, cy],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const scale = (2 * size) / DEFAULT_WIDTH;
      setCx(dragRef.current.cx0 - dx * scale);
      setCy(dragRef.current.cy0 + dy * scale);
    },
    [size],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleReset = useCallback(() => {
    setCx(0);
    setCy(0);
    setSize(2);
    setMaxIter(256);
  }, []);

  return (
    <div>
      <div class="page-header">
        <h1>Mandelbrot Set</h1>
        <p>Lab 3 — Interactive fractal rendering. Zoom with scroll, pan with drag.</p>
      </div>

      <div class="controls">
        <div class="control-group">
          <span class="control-label">Max iterations</span>
          <input
            type="range"
            min={64}
            max={2048}
            step={64}
            value={maxIter}
            onInput={(e) => setMaxIter(+(e.target as HTMLInputElement).value)}
          />
          <span class="control-value">{maxIter}</span>
        </div>

        <div class="control-group">
          <span class="control-label">Palette</span>
          <select value={palette} onChange={(e) => setPalette((e.target as HTMLSelectElement).value as PaletteName)}>
            <option value="classic">Classic</option>
            <option value="inferno">Inferno</option>
            <option value="viridis">Viridis</option>
          </select>
        </div>

        <div class="control-group">
          <span class="control-label">Workers</span>
          <select value={workers} onChange={(e) => setWorkers(+(e.target as HTMLSelectElement).value)}>
            {[1, 2, 4, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleReset}>Reset View</button>
      </div>

      {loading ? (
        <div class="card">Loading WASM module…</div>
      ) : (
        <div class="canvas-wrap">
          <canvas
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: dragRef.current ? 'grabbing' : 'grab' }}
          />
        </div>
      )}

      <div class="stats">
        <span class="stat">
          Time: <strong>{time.toFixed(1)} ms</strong>
        </span>
        <span class="stat">
          Center: <strong>({cx.toFixed(4)}, {cy.toFixed(4)})</strong>
        </span>
        <span class="stat">
          Zoom: <strong>{(2 / size).toFixed(1)}×</strong>
        </span>
        <span class="stat">
          Size: <strong>{DEFAULT_WIDTH}×{DEFAULT_HEIGHT}</strong>
        </span>
      </div>
    </div>
  );
}
