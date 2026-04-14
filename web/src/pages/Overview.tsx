interface Props {
  onNavigate: (tab: string) => void;
}

const LABS = [
  {
    id: 'mandelbrot',
    num: 'Lab 3',
    title: 'Mandelbrot Set',
    desc: 'Interactive fractal rendering with zoom/pan. Compare single vs. multi-worker computation.',
  },
  {
    id: 'heat',
    num: 'Lab 5',
    title: 'Heat Equation',
    desc: 'Watch Jacobi iteration converge on a 2D temperature grid. Animated heatmap with residual chart.',
  },
  {
    id: 'sort',
    num: 'Lab 4',
    title: 'Multi-Sort',
    desc: '4-way recursive merge-sort visualized as a bar chart with step-through animation.',
  },
  {
    id: 'pi',
    num: 'Lab 2',
    title: 'Pi Computation',
    desc: 'Numerical integration convergence to π. See how more steps improve accuracy.',
  },
  {
    id: 'speedup',
    num: 'All Labs',
    title: 'Speedup Charts',
    desc: 'Strong & weak scaling curves. Compare parallel efficiency across labs with Amdahl\'s law overlay.',
  },
];

export function Overview({ onNavigate }: Props) {
  return (
    <div>
      <div class="page-header">
        <h1>Parallel Computing Labs</h1>
        <p>
          Five OpenMP labs from FIB-UPC compiled to WebAssembly and running in your browser.
          Each lab's C kernel is distributed across Web Workers to simulate parallel execution
          and measure real speedup.
        </p>
      </div>

      <div class="lab-grid">
        {LABS.map((lab) => (
          <a key={lab.id} class="lab-card" onClick={() => onNavigate(lab.id)}>
            <div class="lab-num">{lab.num}</div>
            <h3>{lab.title}</h3>
            <p>{lab.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
