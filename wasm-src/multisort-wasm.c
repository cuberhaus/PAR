/*
 * 4-way merge-sort — WASM-portable version.
 * Stripped from lab4/codes/multisort-omp-t-cutoff.c + lab4/lab4/kernels.c:
 * removed OpenMP pragmas, inlined basicsort/basicmerge, removed CLI/timing.
 */
#include <stdlib.h>
#include <string.h>
#include <emscripten.h>

#define T int

/* ---- basic kernels (from kernels.c) ---- */

static int qsort_helper(const void *a, const void *b) {
    return (*(const T *)a) - (*(const T *)b);
}

static void basicsort(long n, T data[]) {
    qsort(data, (size_t)n, sizeof(T), qsort_helper);
}

static long lmin(long a, long b) { return a < b ? a : b; }

static void find_pivot(T *left, T *right, long n, long start,
                       long *leftStart, long *rightStart) {
    if (start == 0) {
        *leftStart = 0;
        *rightStart = 0;
        return;
    }
    long jumpSize;
    *leftStart = start / 2L;
    *rightStart = start / 2L;
    jumpSize = lmin(start / 2L, n - start / 2L) / 2L;

    while (1) {
        /* pivots_are_aligned */
        int aligned = 0;
        if (*leftStart == 0 || *rightStart == 0 ||
            *leftStart == n || *rightStart == n) {
            aligned = 1;
        } else if (left[*leftStart] <= right[*rightStart] &&
                   right[*rightStart - 1] <= left[*leftStart]) {
            aligned = 1;
        } else if (right[*rightStart] <= left[*leftStart] &&
                   left[*leftStart - 1] <= right[*rightStart]) {
            aligned = 1;
        }

        if (aligned) return;

        /* must_decrease_left */
        if (left[*leftStart] > right[*rightStart]) {
            *leftStart -= jumpSize;
            *rightStart += jumpSize;
        } else {
            *rightStart -= jumpSize;
            *leftStart += jumpSize;
        }
        jumpSize = jumpSize / 2L;
        if (jumpSize == 0) jumpSize = 1;
    }
}

static void basicmerge(long n, T left[], T right[], T result[],
                       long start, long length) {
    long leftStart, rightStart;
    find_pivot(left, right, n, start, &leftStart, &rightStart);

    T *out = result + start;
    while (length != 0) {
        if (leftStart == n) {
            *out++ = right[rightStart++];
        } else if (rightStart == n) {
            *out++ = left[leftStart++];
        } else if (left[leftStart] <= right[rightStart]) {
            *out++ = left[leftStart++];
        } else {
            *out++ = right[rightStart++];
        }
        length--;
    }
}

/* ---- recursive merge (sequential, no OMP) ---- */

static long g_min_merge_size;

static void merge_rec(long n, T left[], T right[], T result[],
                      long start, long length) {
    if (length < g_min_merge_size * 2L) {
        basicmerge(n, left, right, result, start, length);
    } else {
        merge_rec(n, left, right, result, start, length / 2);
        merge_rec(n, left, right, result, start + length / 2, length / 2);
    }
}

/* ---- recursive 4-way sort (sequential, no OMP) ---- */

static long g_min_sort_size;

static void multisort_rec(long n, T data[], T tmp[]) {
    if (n >= g_min_sort_size * 4L) {
        multisort_rec(n / 4L, &data[0],           &tmp[0]);
        multisort_rec(n / 4L, &data[n / 4L],      &tmp[n / 4L]);
        multisort_rec(n / 4L, &data[n / 2L],      &tmp[n / 2L]);
        multisort_rec(n / 4L, &data[3L * n / 4L], &tmp[3L * n / 4L]);

        merge_rec(n / 4L, &data[0],      &data[n / 4L],      &tmp[0],      0, n / 2L);
        merge_rec(n / 4L, &data[n / 2L], &data[3L * n / 4L], &tmp[n / 2L], 0, n / 2L);

        merge_rec(n / 2L, &tmp[0], &tmp[n / 2L], &data[0], 0, n);
    } else {
        basicsort(n, data);
    }
}

/* ---- public API ---- */

/*
 * Sort data[] in-place using the 4-way merge-sort algorithm.
 * n:              number of elements (should be a power of 2)
 * data:           array to sort
 * tmp:            scratch buffer (same size as data)
 * min_sort_size:  base-case threshold for sorting
 * min_merge_size: base-case threshold for merging
 */
EMSCRIPTEN_KEEPALIVE
void multisort(T *data, T *tmp, long n, long min_sort_size, long min_merge_size) {
    g_min_sort_size = min_sort_size;
    g_min_merge_size = min_merge_size;
    multisort_rec(n, data, tmp);
}

/*
 * Initialize array with deterministic pseudo-random data (same as original).
 */
EMSCRIPTEN_KEEPALIVE
void initialize(T *data, long n) {
    /* Fill with 1..n then Fisher-Yates shuffle for a nice bar-chart visual. */
    for (long i = 0; i < n; i++) data[i] = (T)(i + 1);
    unsigned long seed = 104723UL;
    for (long i = n - 1; i > 0; i--) {
        seed = seed * 6364136223846793005UL + 1442695040888963407UL;
        long j = (long)((seed >> 33) % ((unsigned long)i + 1));
        T tmp = data[i]; data[i] = data[j]; data[j] = tmp;
    }
}

/*
 * Check whether data is sorted. Returns number of unsorted positions.
 */
EMSCRIPTEN_KEEPALIVE
int check_sorted(T *data, long n) {
    int unsorted = 0;
    for (long i = 1; i < n; i++) {
        if (data[i - 1] > data[i]) unsorted++;
    }
    return unsorted;
}
