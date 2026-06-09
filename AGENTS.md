# PAR

Frozen coursework: Parallelism (Paral·lelisme) labs at FIB-UPC, progressing through OpenMP basics, Mandelbrot, multisort, and a parallel heat-equation (Jacobi) solver, with scalability analysis and Extrae traces. A web frontend (`wasm-src/` + `web/`) was later added to visualise the kernels in the browser via Emscripten.

## Architecture
- `lab1/`–`lab5/`: per-lab C sources, scripts, and reports (lab2 OpenMP intro, lab3 Mandelbrot, lab4 multisort, lab5 heat solver).
- `boada/`: artefacts/scripts targeted at the FIB `boada` cluster.
- `wasm-src/`, `web/`: later add-on — C kernels stripped of OpenMP/X11 compiled to WASM and rendered by a Preact + Vite app.
- Root `Makefile` only drives the WASM/web build, not the labs.

## Build and Test
- Labs: `cd labN/...` and use the lab's own `Makefile` (gcc/icc + OpenMP, `-fopenmp`); run on a multicore machine.
- Web demo: `make wasm && make dev` (needs Emscripten SDK + Node) or `make docker` → http://localhost:8089.

## Pitfalls
- Coursework is frozen — don't refactor lab sources or "fix" performance code.
- Labs were graded on the FIB `boada` cluster with `icc`, Tareador, and Extrae; speedup/trace numbers are not reproducible on a laptop and `.prv`/`.pcf`/`.row` tooling is not installed by default.

See [README.md](README.md).
