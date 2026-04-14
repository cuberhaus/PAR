/*
 * 2D Heat equation solver (Jacobi iteration) — WASM-portable version.
 * Stripped from lab5/code/solver-omp.c: removed OpenMP pragmas.
 * Exports jacobi_step() and copy_mat() for use via Emscripten.
 */
#include <emscripten.h>

/*
 * One Jacobi relaxation step.
 *
 * u:     current temperature grid  (sizex * sizey doubles, row-major)
 * unew:  output grid after one step
 * sizex, sizey: grid dimensions (including boundary rows/cols)
 *
 * Returns the sum of squared differences (residual).
 */
EMSCRIPTEN_KEEPALIVE
double jacobi_step(double *u, double *unew, int sizex, int sizey) {
    double sum = 0.0;

    for (int i = 1; i < sizex - 1; i++) {
        for (int j = 1; j < sizey - 1; j++) {
            double tmp = 0.25 * (u[i * sizey + (j - 1)] +   /* left   */
                                 u[i * sizey + (j + 1)] +   /* right  */
                                 u[(i - 1) * sizey + j] +   /* top    */
                                 u[(i + 1) * sizey + j]);    /* bottom */
            double diff = tmp - u[i * sizey + j];
            sum += diff * diff;
            unew[i * sizey + j] = tmp;
        }
    }

    return sum;
}

/*
 * Copy interior cells from u to v.
 */
EMSCRIPTEN_KEEPALIVE
void copy_mat(double *u, double *v, int sizex, int sizey) {
    for (int i = 1; i < sizex - 1; i++) {
        for (int j = 1; j < sizey - 1; j++) {
            v[i * sizey + j] = u[i * sizey + j];
        }
    }
}

/*
 * Initialize a grid with boundary conditions:
 * top row = 1.0, all others = 0.0.
 */
EMSCRIPTEN_KEEPALIVE
void init_grid(double *u, int sizex, int sizey) {
    for (int i = 0; i < sizex * sizey; i++) {
        u[i] = 0.0;
    }
    /* Top boundary = 1.0 */
    for (int j = 0; j < sizey; j++) {
        u[j] = 1.0;
    }
}
