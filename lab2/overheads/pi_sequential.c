/*
 * Compute pi by approximating the area under the curve f(x) = 4 / (1 + x*x)
 * between 0 and 1.
 *
 * initial sequential version 
 */
#include <stdio.h>
#include <stdlib.h>
#include <omp.h>	/* OpenMP */

int main(int argc, char *argv[]) {

    double x, sum=0.0, pi=0.0;
    double start,end;

    const char Usage[] = "Usage: pi <num_steps> (try 1000000000)\n";
    if (argc < 2) {
	fprintf(stderr, Usage);
	exit(1);
    }

    int num_steps = atoi(argv[1]);
    double step = 1.0/(double) num_steps;

    start= omp_get_wtime();

    for (int i=0; i < num_steps; ++i) {
        x = (i+0.5)*step;
        sum += 4.0/(1.0+x*x);
        }
    pi = step * sum;

    end = omp_get_wtime();
    printf("Wall clock execution time  = %.9f seconds\n", end-start);

    /* print results */
    printf("Value of pi = %12.10f\n", pi);

    return EXIT_SUCCESS;
}
