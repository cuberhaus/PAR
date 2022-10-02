#!/bin/bash

#SBATCH --job-name=submit-omp.sh
#SBATCH -D .
#SBATCH --output=submit-omp.sh.o%j
#SBATCH --error=submit-omp.sh.e%j

USAGE="\n USAGE: ./submit-omp.sh prog [options] \n
        prog        -> Program name \n
        options     -> num_iterations num_procs (default values: 100000000 4)\n"

num_iterations=100000000
num_procs=4

if (test $# -eq 3)
then
        num_iterations=$2
        num_procs=$3
fi

if (test $# -ne 1 && test $# -ne 3)
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

make $1-omp
export OMP_NUM_THREADS=$num_procs
export KMP_AFFINITY=scatter

./$1-omp $num_iterations
