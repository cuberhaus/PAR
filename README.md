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
│   └── lab3/                  # Parallel lab 3
├── lab4/
│   └── lab4/                  # Parallel lab 4
└── lab5/
    └── lab5/                  # Heat equation solver
        ├── heat.c             # Main heat simulation driver
        ├── solver.c           # Sequential solver
        ├── solver-omp.c       # OpenMP parallel solver
        ├── solver-tareador.c  # Tareador instrumented solver
        ├── heat-tareador.c    # Tareador instrumented driver
        ├── misc.c             # Utility functions
        ├── heat.h             # Header
        ├── Makefile           # Builds with icc / tar-clang / -fopenmp
        └── *.sh               # Cluster submission scripts
```

## Tech Stack

- **C** with OpenMP for parallelization
- **Intel C Compiler (icc)** and Tareador for analysis
- **Extrae** for trace generation (`.prv`, `.pcf`, `.row`)
- **Makefile**-based build system
