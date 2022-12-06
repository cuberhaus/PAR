#!/bin/bash

#SBATCH --job-name=submit-omp.sh
#SBATCH -D .
#SBATCH --output=submit-omp.sh.o%j
#SBATCH --error=submit-omp.sh.e%j

USAGE="\n USAGE: ./submit-omp.sh prog solver numthreads \n
        prog        -> Program name\n
        solver      -> 0: Jacobi; 1: Gauss-Seidel\n
        numthreads  -> Number of threads in parallel execution\n"

if (test $# -lt 3 || test $# -gt 3)
then
        echo -e $USAGE
        exit 0
fi

HOST=$(echo $HOSTNAME | cut -f 1 -d'.')

if [ ${HOST} = 'boada-6' ] || [ ${HOST} = 'boada-7' ] || [ ${HOST} == 'boada-8' ]
then
        echo "Use sbatch to execute this script"
        exit 0
fi

if (test $2 = 0)
then
    SOLVER="jacobi"
else
    if (test $2 = 1)
    then
        SOLVER="gausseidel"
    else
        echo "Use 0 or 1 to specify solver type"
        exit 0
    fi
fi

make $1

export OMP_NUM_THREADS=$3

./$1 test.dat -a $2 -o heat-${SOLVER}.ppm > $1-${SOLVER}-$3-${HOST}.txt
