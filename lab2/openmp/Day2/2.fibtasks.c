#include <stdlib.h>
#include <stdio.h>
#include "omp.h"
#define N 25

/* Q1: Why all tasks are created and executed by the same thread?     */
/*     In other words, why the program is not executing in parallel?  */
/* Q2: Modify the code so that tasks are executed in parallel and     */
/*     each iteration of the while loop is executed only once         */
/* Q3: What is the firstprivate(p) clause doing? Comment it and       */
/*     execute again. What is happening with the execution? Why?      */

struct node {
   int data;
   int fibdata;
   int threadnum;
   struct node* next;
};

int fib(int n) {
   int x, y;
   if (n < 3) {
        return(1);
   } else {
      x = fib(n - 1);
      y = fib(n - 2);
      return (x + y);
   }
}

void processwork(struct node* p)
{
   int n;
   n = p->data;
   p->fibdata += fib(n);
   p->threadnum = omp_get_thread_num();
}

struct node* init_list(int nelems) {
    int i;
    struct node *head, *p1, *p2;

    p1 = malloc(sizeof(struct node));
    head = p1;
    p1->data = 1;
    p1->fibdata = 0;
    p1->threadnum = 0;
    for (i=2; i<=nelems; i++) {
       p2  = malloc(sizeof(struct node));
       p1->next = p2;
       p2->data = i;
       p2->fibdata = 0;
       p2->threadnum = 0;
       p1 = p2;
    }
    p1->next = NULL;
    return head;
}

struct node *p;

int main(int argc, char *argv[]) {
     struct node *temp, *head;

     omp_set_num_threads(6);
     printf("Staring computation of Fibonacci for numbers in linked list \n");

     p = init_list(N);
     head = p;

     while (p != NULL) {
	   printf("Thread %d creating task that will compute %d\n", omp_get_thread_num(), p->data);
	   #pragma omp task firstprivate(p)
	       processwork(p);
	   p = p->next;
     }
     printf("Finished creation of tasks to compute the Fibonacci for numbers in linked list \n");

     printf("Finished computation of Fibonacci for numbers in linked list \n");
     p = head;
     while (p != NULL) {
        printf("%d: %d computed by thread %d \n", p->data, p->fibdata, p->threadnum);
        temp = p->next;
        free (p);
        p = temp;
     }
     free (p);

     return 0;
}
