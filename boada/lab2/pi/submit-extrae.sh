#!/bin/bash

#SBATCH --job-name=submit-extrae.sh
#SBATCH -D .
#SBATCH --output=submit-extrae.sh.o%j
#SBATCH --error=submit-extrae.sh.e%j

USAGE="\n USAGE: ./submit-extrae.sh prog [options] \n
        prog        -> Program name \n
        options     -> num_iterations num_procs (default values: 100000 4)\n"

num_iterations=100000
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

export LD_PRELOAD=${EXTRAE_HOME}/lib/libomptrace.so
./$1-omp $num_iterations
unset LD_PRELOAD

mpi2prv -f TRACE.mpits -o $1-omp.prv -e $1-omp -paraver
rm -rf  TRACE.mpits set-0 >& /dev/null
