#include <stdio.h>
#include <stdlib.h>
#include <omp.h>	/* OpenMP */
#define N 12

/* Execute multiple times before answering the questions below   */
/* Q1: Which iterations of the loops are executed by each thread */
/*     for each task grainsize or num_tasks specified?           */
/* Q2: Change the value for grainsize and num_tasks to 5. How    */
/*     many iterations is now each thread executing? How is the  */
/*     number of iterations decided in each case?                */
/* Q3: Can grainsize and num_tasks be used at the same time in   */
/*     the same loop?                                            */
/* Q4: What is happening with the execution of tasks if the      */
/*     nogroup clause is uncommented in the first loop? Why?     */

#define VALUE 4

int main()
{
    int i;

    omp_set_num_threads(4);
    #pragma omp parallel
    #pragma omp single
    {
    	printf("Thread %d distributing %d iterations with grainsize(%d) ...\n", omp_get_thread_num(), N, VALUE);
    	#pragma omp taskloop grainsize(VALUE) // nogroup
    	for (i=0; i < N; i++) {
		printf("Loop 1: (%d) gets iteration %d\n", omp_get_thread_num(), i);
    	}

    	printf("Thread %d distributing %d iterations with num_tasks(%d) ...\n", omp_get_thread_num(), N, VALUE);
    	#pragma omp taskloop num_tasks(VALUE)
    	for (i=0; i < N; i++) {
		printf("Loop 2: (%d) gets iteration %d\n", omp_get_thread_num(), i);
    	}
    }

    return 0;
}
