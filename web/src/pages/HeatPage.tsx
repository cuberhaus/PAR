import { useRef, useState, useCallback, useEffect } from 'preact/hooks';
import { loadWasm, type EmModule } from '../lib/wasm-loader';
import { heatColor } from '../lib/palettes';

export function HeatPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [mod, setMod] = useState<EmModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState(64);
  const [playing, setPlaying] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [residual, setResidual] = useState(0);
  const [residuals, setResiduals] = useState<number[]>([]);
  const animRef = useRef<number>(0);

  // WASM pointers
  const ptrsRef = useRef<{ u: number; unew: number } | null>(null);

  useEffect(() => {
    loadWasm('solver').then((m) => {
      setMod(m);
      setLoading(false);
    });
  }, []);

  const initGrid = useCallback(() => {
    if (!mod) return;
    // Free previous
    if (ptrsRef.current) {
      mod._free(ptrsRef.current.u);
      mod._free(ptrsRef.current.unew);
    }
    const n = gridSize * gridSize;
    const uPtr = mod._malloc(n * 8);
    const unewPtr = mod._malloc(n * 8);
    mod.ccall('init_grid', 'void', ['number', 'number', 'number'], [uPtr, gridSize, gridSize]);
    mod.ccall('init_grid', 'void', ['number', 'number', 'number'], [unewPtr, gridSize, gridSize]);
    ptrsRef.current = { u: uPtr, unew: unewPtr };
    setIteration(0);
    setResidual(0);
    setResiduals([]);
    renderHeatmap();
  }, [mod, gridSize]);

  useEffect(() => {
    if (mod) initGrid();
  }, [mod, gridSize, initGrid]);

  const step = useCallback(() => {
    if (!mod || !ptrsRef.current) return 0;
    const { u, unew } = ptrsRef.current;
    const res = mod.ccall(
      'jacobi_step',
      'number',
      ['number', 'number', 'number', 'number'],
      [u, unew, gridSize, gridSize],
    ) as number;
    // Copy unew → u
    mod.ccall('copy_mat', 'void', ['number', 'number', 'number', 'number'], [unew, u, gridSize, gridSize]);
    return res;
  }, [mod, gridSize]);

  const renderHeatmap = useCallback(() => {
    if (!mod || !ptrsRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const g = gridSize;
    canvas.width = g;
    canvas.height = g;

    const view = new Float64Array(mod.HEAPF64.buffer, ptrsRef.current.u, g * g);
    const imageData = ctx.createImageData(g, g);
    const data = imageData.data;

    for (let i = 0; i < g * g; i++) {
      const [r, gb, b, a] = heatColor(view[i], 0, 1);
      const off = i * 4;
      data[off] = r;
      data[off + 1] = gb;
      data[off + 2] = b;
      data[off + 3] = a;
    }
    ctx.putImageData(imageData, 0, 0);
  }, [mod, gridSize]);

  const renderChart = useCallback(() => {
    if (!chartRef.current || residuals.length === 0) return;
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const w = 400;
    const h = 150;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#12121a';
    ctx.fillRect(0, 0, w, h);

    const maxR = Math.max(...residuals, 1e-10);
    const scaleX = w / Math.max(residuals.length - 1, 1);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    residuals.forEach((r, i) => {
      const x = i * scaleX;
      const y = h - (Math.log10(r + 1e-20) / Math.log10(maxR + 1e-20)) * (h - 10) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [residuals]);

  useEffect(() => {
    renderChart();
  }, [residuals, renderChart]);

  const doStep = useCallback(() => {
    const res = step();
    setResidual(res);
    setResiduals((prev) => [...prev, res]);
    setIteration((i) => i + 1);
    renderHeatmap();
  }, [step, renderHeatmap]);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(animRef.current);
      return;
    }
    const loop = () => {
      doStep();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, doStep]);

  return (
    <div>
      <div class="page-header">
        <h1>Heat Equation Solver</h1>
        <p>Lab 5 — Jacobi iteration on a 2D temperature grid. Top boundary fixed at 1.0.</p>
      </div>

      <div class="controls">
        <div class="control-group">
          <span class="control-label">Grid size</span>
          <select
            value={gridSize}
            onChange={(e) => {
              setPlaying(false);
              setGridSize(+(e.target as HTMLSelectElement).value);
            }}
          >
            {[16, 32, 64, 128, 256].map((n) => (
              <option key={n} value={n}>{n}×{n}</option>
            ))}
          </select>
        </div>

        <button class={playing ? '' : 'primary'} onClick={() => setPlaying(!playing)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button onClick={doStep} disabled={playing}>
          Step
        </button>
        <button onClick={initGrid}>
          Reset
        </button>
      </div>

      {loading ? (
        <div class="card">Loading WASM module…</div>
      ) : (
        <div class="grid-2">
          <div>
            <div class="canvas-wrap">
              <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />
            </div>
            <div class="stats">
              <span class="stat">Iteration: <strong>{iteration}</strong></span>
              <span class="stat">Residual: <strong>{residual.toExponential(3)}</strong></span>
            </div>
          </div>
          <div>
            <div class="card">
              <div class="card-title">Residual Convergence</div>
              <div class="card-subtitle">Log-scale residual per iteration</div>
              <canvas ref={chartRef} style={{ width: '100%', height: '150px' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
