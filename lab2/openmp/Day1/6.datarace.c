#include <stdio.h>
#include <omp.h>
/* Q1: Is the program executing correctly? Why?               */
/* Q2: Propose two alternative solutions to make it correct,  */
/*     without changing the structure of the program (just    */
/*     using directives or clauses) and never making use of   */
/*     critical. Explain why they make the execution correct. */

#define N 1 << 20 
int vector[N]={0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 15, 14, 13, 12, 11, 10, 9, 8, 15, 15};

int main() 
{
    int i, countmax = 0;
    int maxvalue = 15;

    omp_set_num_threads(8);
    #pragma omp parallel private(i) 
    {
    int id = omp_get_thread_num();
    int howmany = omp_get_num_threads();

    for (i=id; i < N; i+=howmany) {
        if (vector[i]==maxvalue) 
            countmax++;
        }
    }

    if (countmax==3) 
         printf("Program executed correctly - maxvalue=%d found %d times\n", maxvalue, countmax);
    else printf("Sorry, something went wrong - incorrect maxvalue=%d found %d times\n", maxvalue, countmax);

    return 0;
}
