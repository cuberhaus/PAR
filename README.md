# PAR

Parallel computing (Paral·lelisme) course labs at FIB-UPC, focused on OpenMP parallelization and performance analysis.

## Overview

A series of lab assignments progressing from OpenMP basics to parallelizing a heat equation solver (Jacobi/Gauss-Seidel), with scalability analysis and Extrae trace generation for performance profiling.

## Structure

```
├── lab2/
│   └── openmp/                # OpenMP introduction
│       ├── Day1/              # Basic exercises
│       ├── Day2/              # Advanced exercises
│       ├── pi/                # Pi computation
│       └── overheads/         # Overhead measurement
├── lab3/
│   └── lab3/                  # Mandelbrot set computation
├── lab4/
│   └── lab4/                  # Multi-sort (4-way merge)
├── lab5/
│   └── lab5/                  # Heat equation solver (Jacobi)
├── wasm-src/                  # WASM-portable C kernels
│   ├── mandel-wasm.c          # Mandelbrot (stripped of X11)
│   ├── solver-wasm.c          # Jacobi solver (stripped of OpenMP)
│   ├── pi-wasm.c              # Pi computation
│   ├── multisort-wasm.c       # 4-way merge-sort
│   └── Makefile               # Emscripten build → web/public/wasm/
├── web/                       # Preact + Vite frontend
│   ├── src/
│   │   ├── app.tsx            # Tab-based shell
│   │   ├── pages/             # Mandelbrot, Heat, Sort, Pi, Speedup
│   │   └── lib/               # WASM loader, color palettes
│   ├── vite.config.ts
│   └── package.json
├── Dockerfile                 # Multi-stage (emscripten → node → nginx)
├── docker-compose.yml
└── Makefile                   # wasm, dev, build, docker, test, clean
```

## Web Frontend

Interactive browser-based visualisations of the parallel computing kernels, compiled from C to WebAssembly via Emscripten.

| Demo | Description |
|------|-------------|
| **Mandelbrot** | Zoom/pan fractal explorer with palette selection, Canvas rendering |
| **Heat Equation** | Jacobi solver with play/pause/step, heatmap + residual chart |
| **Multi-sort** | Animated bar-chart visualisation of 4-way merge-sort |
| **Pi Convergence** | Log-scale error chart at increasing step counts |
| **Speedup** | Benchmark all kernels with simulated workers, ideal-linear overlay |

### Quick Start

```bash
# Standalone (requires Emscripten SDK + Node)
make wasm && make dev        # http://localhost:8089

# Docker
make docker                  # http://localhost:8089
```

## Tech Stack

- **C** with OpenMP for parallelization
- **Intel C Compiler (icc)** and Tareador for analysis
- **Extrae** for trace generation (`.prv`, `.pcf`, `.row`)
- **Emscripten** for C → WebAssembly compilation
- **Preact + Vite + TypeScript** for the web frontend
- **Docker** multi-stage build (emscripten → node → nginx)
- **Makefile**-based build system
