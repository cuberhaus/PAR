/*
 * Compute pi by approximating the area under the curve f(x) = 4 / (1 + x*x)
 * between 0 and 1.
 *
 * parallel version using OpenMP
 */
#include <stdio.h>
#include <stdlib.h>
#include <omp.h>	/* OpenMP */

#if _DEBUG_
   #define _DEBUG_ 1
#else
   #define _DEBUG_ 0
#endif

int main(int argc, char *argv[]) {

    double x, sum=0.0, pi=0.0;
#if !_DEBUG_
    double start,end;
#endif
    int i;

    const char Usage[] = "Usage: pi <num_steps> (try 1000000000)\n";
    if (argc < 2) {
	fprintf(stderr, Usage);
	exit(1);
    }

    int num_steps = atoi(argv[1]);
    double step = 1.0/(double) num_steps;

#if !_DEBUG_
    start= omp_get_wtime();
#endif

    double sum1=0.0, sum2=0.0;
    #pragma omp parallel 
    #pragma omp single
    {
        #pragma omp task private(i,x) depend(out: sum1)
        {
#if _DEBUG_
        int id = omp_get_thread_num();
#endif
        for (i=0; i < num_steps/2; i++) {
            x = (i+0.5)*step;
            sum1 += 4.0/(1.0+x*x);
#if _DEBUG_
            printf("thread id:%d it:%d\n",id,i);
#endif
        }
        }

        #pragma omp task private(i,x) depend(out: sum2)
        {
#if _DEBUG_
        int id = omp_get_thread_num();
#endif
        for (i=num_steps/2; i < num_steps; i++) {
            x = (i+0.5)*step;
            sum2 += 4.0/(1.0+x*x);
#if _DEBUG_
            printf("thread id:%d it:%d\n",id,i);
#endif
        }
        }

        #pragma omp task depend(in: sum1, sum2)
        sum += sum1 + sum2; 
    }

    pi = step * sum;

#if !_DEBUG_
    end = omp_get_wtime();
    printf("Wall clock execution time  = %.9f seconds\n", end-start);
#endif

    /* print results */
    printf("Value of pi = %12.10f\n", pi);

    return EXIT_SUCCESS;
}
