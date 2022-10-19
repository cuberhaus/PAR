#include <stdio.h>
#include <unistd.h>
#include <omp.h>

/* Execute with ./4.data_sharing                               */
/* Q1: Which is the value of x after the execution of each     */
/*     parallel region with different data-sharing attribute   */
/*     (shared, private, firstprivate and reduction)?          */
/*     Explain why, repeating the execution many times if      */
/*     necessary.                                              */

int main ()
{
    omp_set_num_threads(32);

    int x=0;
    #pragma omp parallel shared(x) // shared could be removed, it is the default
    {
        int tmp = x;
        sleep(1);                 // this is just to force problems
	    x= tmp + omp_get_thread_num();
    }
    printf("After first parallel (shared) x is: %d\n",x);

    x=5;
    #pragma omp parallel private(x)
    {
    	printf("After second parallel (private) x is: %d\n",x);
	x+=omp_get_thread_num();
    }
    printf("After second parallel (private) x is: %d\n",x);

    #pragma omp parallel firstprivate(x)
    {
	x+=omp_get_thread_num();
    }
    printf("After third  parallel (firstprivate) x is: %d\n",x);

    #pragma omp parallel reduction(+:x)
    {
	x+=omp_get_thread_num();
    }
    printf("After fourth parallel (reduction) x is: %d\n",x);

    return 0;
}
