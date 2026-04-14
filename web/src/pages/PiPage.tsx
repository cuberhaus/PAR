import { useRef, useState, useCallback, useEffect } from 'preact/hooks';
import { loadWasm, type EmModule } from '../lib/wasm-loader';

export function PiPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [mod, setMod] = useState<EmModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState(100_000);
  const [piValue, setPiValue] = useState(0);
  const [time, setTime] = useState(0);
  const [convergence, setConvergence] = useState<{ steps: number; value: number; error: number }[]>([]);

  useEffect(() => {
    loadWasm('pi').then((m) => {
      setMod(m);
      setLoading(false);
    });
  }, []);

  const compute = useCallback(() => {
    if (!mod) return;

    const points: typeof convergence = [];
    // Compute at increasing step counts to show convergence
    const counts = [100, 1000, 10000, 50000, 100000, 500000, steps].filter((n) => n <= steps);
    const unique = [...new Set(counts)].sort((a, b) => a - b);

    const t0 = performance.now();
    for (const n of unique) {
      const pi = mod.ccall('compute_pi', 'number', ['number'], [n]) as number;
      points.push({ steps: n, value: pi, error: Math.abs(pi - Math.PI) });
    }
    setTime(performance.now() - t0);

    const last = points[points.length - 1];
    setPiValue(last.value);
    setConvergence(points);
  }, [mod, steps]);

  useEffect(() => {
    if (mod) compute();
  }, [mod, steps, compute]);

  const renderChart = useCallback(() => {
    if (!chartRef.current || convergence.length === 0) return;
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const w = 600;
    const h = 300;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = { top: 30, right: 20, bottom: 40, left: 60 };

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    // Log-scale X axis
    const minX = Math.log10(convergence[0].steps);
    const maxX = Math.log10(convergence[convergence.length - 1].steps);
    // Log-scale Y axis (error)
    const errors = convergence.map((p) => p.error).filter((e) => e > 0);
    const minY = Math.log10(Math.min(...errors) * 0.5);
    const maxY = Math.log10(Math.max(...errors) * 2);

    const toX = (log: number) => pad.left + ((log - minX) / (maxX - minX || 1)) * chartW;
    const toY = (log: number) => pad.top + chartH - ((log - minY) / (maxY - minY || 1)) * chartH;

    // Grid lines
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 0.5;
    for (let e = Math.ceil(minY); e <= Math.floor(maxY); e++) {
      const y = toY(e);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      ctx.fillStyle = '#8b8b9e';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`1e${e}`, pad.left - 5, y + 3);
    }

    // π reference line
    ctx.strokeStyle = '#22c55e44';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const piY = pad.top + 10;
    ctx.beginPath();
    ctx.moveTo(pad.left, piY);
    ctx.lineTo(w - pad.right, piY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#22c55e';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('π exact', pad.left + 5, piY - 5);

    // Error line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    convergence.forEach((p, i) => {
      if (p.error === 0) return;
      const x = toX(Math.log10(p.steps));
      const y = toY(Math.log10(p.error));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    convergence.forEach((p) => {
      if (p.error === 0) return;
      const x = toX(Math.log10(p.steps));
      const y = toY(Math.log10(p.error));
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Axis labels
    ctx.fillStyle = '#8b8b9e';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Number of Steps (log scale)', w / 2, h - 5);
    ctx.save();
    ctx.translate(15, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Absolute Error (log scale)', 0, 0);
    ctx.restore();
  }, [convergence]);

  useEffect(() => {
    renderChart();
  }, [convergence, renderChart]);

  return (
    <div>
      <div class="page-header">
        <h1>Pi Computation</h1>
        <p>
          Lab 2 — Numerical integration of 4/(1+x²) over [0,1]. Watch the error decrease as step
          count increases.
        </p>
      </div>

      <div class="controls">
        <div class="control-group">
          <span class="control-label">Steps</span>
          <input
            type="range"
            min={100}
            max={10_000_000}
            step={100}
            value={steps}
            onInput={(e) => setSteps(+(e.target as HTMLInputElement).value)}
          />
          <span class="control-value">{steps.toLocaleString()}</span>
        </div>

        <button class="primary" onClick={compute}>
          Compute
        </button>
      </div>

      {loading ? (
        <div class="card">Loading WASM module…</div>
      ) : (
        <div>
          <div class="canvas-wrap">
            <canvas ref={chartRef} />
          </div>
        </div>
      )}

      <div class="stats">
        <span class="stat">
          π ≈ <strong>{piValue.toFixed(12)}</strong>
        </span>
        <span class="stat">
          Error: <strong>{Math.abs(piValue - Math.PI).toExponential(4)}</strong>
        </span>
        <span class="stat">
          Time: <strong>{time.toFixed(1)} ms</strong>
        </span>
      </div>
    </div>
  );
}
