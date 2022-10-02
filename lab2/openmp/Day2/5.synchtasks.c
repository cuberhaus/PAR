#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include "omp.h"

/* Q1: Draw the task dependence graph that is specified in this program  */
/* Q2: Rewrite the program only using taskwait as task synchronization   */
/*     mechanism (no depend clauses allowed)                             */ 
/* Q3: Rewrite the program only using taskgroup as task synchronization  */
/*     mechanism (no depend clauses allowed)                             */ 
 
void foo1() {
	printf("Starting function foo1\n");
        sleep(1);
	printf("Terminating function foo1\n");
}

void foo2() {
	printf("Starting function foo2\n");
        sleep(1);
	printf("Terminating function foo2\n");
}

void foo3() {
	printf("Starting function foo3\n");
        sleep(3);
	printf("Terminating function foo3\n");
}

void foo4() {
	printf("Starting function foo4\n");
        sleep(1);
	printf("Terminating function foo4\n");
}

void foo5() {
	printf("Starting function foo5\n");
        sleep(1);
	printf("Terminating function foo5\n");
}

int a, b, c, d; 
int main(int argc, char *argv[]) {
     
    #pragma omp parallel
    #pragma omp single
    {
	printf("Creating task foo1\n");
	#pragma omp task depend(out:a)
	foo1();
	printf("Creating task foo2\n");
	#pragma omp task depend(out:b)
	foo2();
	printf("Creating task foo3\n");
	#pragma omp task depend(out:c)
	foo3();
	printf("Creating task foo4\n");
	#pragma omp task depend(in: a, b) depend(out:d)
	foo4();
	printf("Creating task foo5\n");
	#pragma omp task depend(in: c, d)
	foo5();
    }
    return 0;
}
