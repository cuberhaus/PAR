#include <stdio.h>
#include <unistd.h>
#include <omp.h>
/* Q1: Is the program executing correctly? Why?               */
/* Q2: Propose two alternative solutions to make it correct,  */
/*     without changing the structure of the code (just add   */
/*     directives or clauses). Explain why they make the      */
/*     execution correct.                                     */
/* Q3: Write an alternative distribution of iterations to     */
/*     implicit tasks (threads) so that each of them executes */
/*     only one block of consecutive iterations (i.e. N       */
/*     divided by the number of threads.                      */

#define N 1 << 20
int vector[N]={0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 15, 14, 13, 12, 11, 10, 9, 8, 15, 15};

int main()
{
    int i, maxvalue=3;

    omp_set_num_threads(8);
    #pragma omp parallel private(i)
    {
       int id = omp_get_thread_num();
       int howmany = omp_get_num_threads();

       for (i=id; i < N; i+=howmany) {
          if (vector[i] > maxvalue)
          {
             sleep(1); // this is just to force problems
             maxvalue = vector[i];
         }
       }
    }

    if (maxvalue==15)
         printf("Program executed correctly - maxvalue=%d found\n", maxvalue);
    else printf("Sorry, something went wrong - incorrect maxvalue=%d found\n", maxvalue);

    return 0;
}
