import { useRef, useState, useCallback, useEffect } from 'preact/hooks';
import { loadWasm, type EmModule } from '../lib/wasm-loader';

const BAR_COLORS = {
  default: '#6366f1',
  sorted: '#22c55e',
  active: '#f59e0b',
};

export function SortPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mod, setMod] = useState<EmModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [arraySize, setArraySize] = useState(256);
  const [sorted, setSorted] = useState(false);
  const [time, setTime] = useState(0);
  const [data, setData] = useState<Int32Array>(new Int32Array(0));

  useEffect(() => {
    loadWasm('multisort').then((m) => {
      setMod(m);
      setLoading(false);
    });
  }, []);

  const initArray = useCallback(() => {
    if (!mod) return;
    // Fisher-Yates shuffle in JS (avoids wasm32 long/UB issues in C)
    const arr = new Int32Array(arraySize);
    for (let i = 0; i < arraySize; i++) arr[i] = i + 1;
    for (let i = arraySize - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    setData(arr);
    setSorted(false);
    setTime(0);
  }, [mod, arraySize]);

  useEffect(() => {
    if (mod) initArray();
  }, [mod, arraySize, initArray]);

  const renderBars = useCallback(() => {
    if (!canvasRef.current || data.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const w = 600;
    const h = 400;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    const maxVal = Math.max(...data, 1);
    const barW = w / data.length;

    for (let i = 0; i < data.length; i++) {
      const barH = (data[i] / maxVal) * (h - 20);
      const x = i * barW;
      const y = h - barH;
      ctx.fillStyle = sorted ? BAR_COLORS.sorted : BAR_COLORS.default;
      ctx.fillRect(x, y, Math.max(barW - 0.5, 1), barH);
    }
  }, [data, sorted]);

  useEffect(() => {
    renderBars();
  }, [data, sorted, renderBars]);

  const doSort = useCallback(() => {
    if (!mod) return;

    const n = data.length;
    const dataPtr = mod._malloc(n * 4);
    const tmpPtr = mod._malloc(n * 4);

    // Copy data into WASM heap
    const heapView = new Int32Array(mod.HEAP32.buffer, dataPtr, n);
    heapView.set(data);
    // Clear tmp
    const tmpView = new Int32Array(mod.HEAP32.buffer, tmpPtr, n);
    tmpView.fill(0);

    const minSort = Math.max(16, Math.floor(n / 64));
    const minMerge = Math.max(16, Math.floor(n / 64));

    const t0 = performance.now();
    mod.ccall(
      'multisort',
      'void',
      ['number', 'number', 'number', 'number', 'number'],
      [dataPtr, tmpPtr, n, minSort, minMerge],
    );
    setTime(performance.now() - t0);

    const result = new Int32Array(mod.HEAP32.buffer, dataPtr, n);
    setData(new Int32Array(result));
    setSorted(true);

    mod._free(dataPtr);
    mod._free(tmpPtr);
  }, [mod, data]);

  return (
    <div>
      <div class="page-header">
        <h1>4-Way Merge-Sort</h1>
        <p>Lab 4 — Recursive 4-way sort with configurable array size.</p>
      </div>

      <div class="controls">
        <div class="control-group">
          <span class="control-label">Array size</span>
          <select
            value={arraySize}
            onChange={(e) => setArraySize(+(e.target as HTMLSelectElement).value)}
          >
            {[64, 128, 256, 512, 1024, 4096].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <button class="primary" onClick={doSort} disabled={sorted}>
          Sort
        </button>
        <button onClick={initArray}>
          Shuffle
        </button>
      </div>

      {loading ? (
        <div class="card">Loading WASM module…</div>
      ) : (
        <div class="canvas-wrap">
          <canvas ref={canvasRef} />
        </div>
      )}

      <div class="stats">
        <span class="stat">
          Elements: <strong>{arraySize}</strong>
        </span>
        <span class="stat">
          Sort time: <strong>{time.toFixed(2)} ms</strong>
        </span>
        <span class="stat">
          Status: <strong>{sorted ? 'Sorted ✓' : 'Unsorted'}</strong>
        </span>
      </div>
    </div>
  );
}
