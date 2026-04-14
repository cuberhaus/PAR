/*
 * Mandelbrot set computation — WASM-portable version.
 * Stripped from lab3/lab3/mandel-seq.c: removed X11, file I/O, CLI parsing.
 * Exports compute_mandelbrot() for use via Emscripten.
 */
#include <emscripten.h>

#define N 2 /* divergence radius */

/*
 * Compute the Mandelbrot set for a rectangular region.
 *
 * pixels:  output array of iteration counts (width * height ints, row-major)
 * width, height: image dimensions in pixels
 * maxiter: maximum iterations per point
 * cx, cy:  centre of the view in the complex plane
 * size:    half-width of the square view (real/imag span = 2*size)
 */
EMSCRIPTEN_KEEPALIVE
void compute_mandelbrot(int *pixels, int width, int height,
                        int maxiter, double cx, double cy, double size) {
    double real_min = cx - size;
    double imag_min = cy - size;
    double scale_real = (2.0 * size) / (double)width;
    double scale_imag = (2.0 * size) / (double)height;

    for (int row = 0; row < height; ++row) {
        for (int col = 0; col < width; ++col) {
            double zr = 0.0, zi = 0.0;
            double cr = real_min + (double)col * scale_real;
            double ci = imag_min + (double)(height - 1 - row) * scale_imag;

            int k = 0;
            double lengthsq, temp;
            do {
                temp = zr * zr - zi * zi + cr;
                zi = 2.0 * zr * zi + ci;
                zr = temp;
                lengthsq = zr * zr + zi * zi;
                ++k;
            } while (lengthsq < (N * N) && k < maxiter);

            pixels[row * width + col] = k;
        }
    }
}

/*
 * Compute a single row — useful for distributing work across Web Workers.
 *
 * row_pixels: output array (width ints)
 * row:        which row to compute (0 = top)
 */
EMSCRIPTEN_KEEPALIVE
void compute_mandelbrot_row(int *row_pixels, int width, int height,
                            int maxiter, double cx, double cy, double size,
                            int row) {
    double real_min = cx - size;
    double imag_min = cy - size;
    double scale_real = (2.0 * size) / (double)width;
    double scale_imag = (2.0 * size) / (double)height;

    double ci = imag_min + (double)(height - 1 - row) * scale_imag;

    for (int col = 0; col < width; ++col) {
        double zr = 0.0, zi = 0.0;
        double cr = real_min + (double)col * scale_real;

        int k = 0;
        double lengthsq, temp;
        do {
            temp = zr * zr - zi * zi + cr;
            zi = 2.0 * zr * zi + ci;
            zr = temp;
            lengthsq = zr * zr + zi * zi;
            ++k;
        } while (lengthsq < (N * N) && k < maxiter);

        row_pixels[col] = k;
    }
}
