#!/bin/bash

#SBATCH --job-name=submit-extrae.sh
#SBATCH -D .
#SBATCH --output=submit-extrae.sh.o%j
#SBATCH --error=submit-extrae.sh.e%j


USAGE="\n USAGE: submit-extrae.sh PROG size n_th\n
        PROG   -> omp program name\n
        size   -> size of the problem\n
        n_th   -> number of threads\n"

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

make $1
export OMP_NUM_THREADS=$3
export KMP_AFFINITY=scatter

export LD_PRELOAD=${EXTRAE_HOME}/lib/libomptrace.so
./$1 $2 $3
unset LD_PRELOAD

mpi2prv -f TRACE.mpits -o $1-$2-$3-${HOST}.prv -e $1 -paraver
rm -rf  TRACE.mpits set-0 >& /dev/null
