/*
 * Pi computation via numerical integration — WASM-portable version.
 * Stripped from lab2/pi/pi-v0.c: removed OpenMP and CLI parsing.
 * Approximates the area under f(x) = 4 / (1 + x*x) between 0 and 1.
 */
#include <emscripten.h>

/*
 * Compute pi using the rectangle rule with num_steps intervals.
 */
EMSCRIPTEN_KEEPALIVE
double compute_pi(int num_steps) {
    double step = 1.0 / (double)num_steps;
    double sum = 0.0;

    for (int i = 0; i < num_steps; ++i) {
        double x = (i + 0.5) * step;
        sum += 4.0 / (1.0 + x * x);
    }

    return step * sum;
}

/*
 * Compute a partial sum for a slice [start, end) of the integration range.
 * Useful for distributing work across Web Workers.
 */
EMSCRIPTEN_KEEPALIVE
double compute_pi_slice(int start, int end, int num_steps) {
    double step = 1.0 / (double)num_steps;
    double sum = 0.0;

    for (int i = start; i < end; ++i) {
        double x = (i + 0.5) * step;
        sum += 4.0 / (1.0 + x * x);
    }

    return step * sum;
}
