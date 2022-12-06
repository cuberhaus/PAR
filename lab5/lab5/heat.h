/*
 * heat.h
 *
 * Global definitions for the iterative solver
 */

#include <stdio.h>

// configuration

typedef struct
{
    float posx;
    float posy;
    float range;
    float temp;
}
heatsrc_t;

typedef struct
{
    unsigned maxiter;       // maximum number of iterations
    unsigned resolution;    // spatial resolution
    double   residual;      // value for convergence
    int      algorithm;     // 0=>Jacobi, 1=>Gauss

    unsigned visres;        // visualization resolution

    double *u, *uhelp;
    double *uvis;

    unsigned   numsrcs;     // number of heat sources
    heatsrc_t *heatsrcs;
}
algoparam_t;

// function declarations

// misc.c
int initialize( algoparam_t *param );
int finalize( algoparam_t *param );
void write_image( FILE * f, double *u,
		  unsigned sizex, unsigned sizey );
int coarsen(double *uold, unsigned oldx, unsigned oldy ,
	    double *unew, unsigned newx, unsigned newy );
int read_input( FILE *infile, algoparam_t *param );
void print_params( algoparam_t *param );
double wtime();

// solver in solver.c
void copy_mat ( double *u, double *v, unsigned sizex, unsigned sizey );
double solve ( double *u, double *unew, unsigned sizex, unsigned sizey );
