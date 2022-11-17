#!/bin/bash

USAGE="\n USAGE: ./run-debug.sh prog [options] \n
        prog        -> Program name \n
        options     -> num_iterations num_procs (default values: 32 4)\n"

num_iterations=32
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

make $1-debug

export OMP_NUM_THREADS=$num_procs

./$1-debug $num_iterations
