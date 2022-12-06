#!/bin/bash

#SBATCH --job-name=submit-seq.sh
#SBATCH -D .
#SBATCH --output=submit-seq.sh.o%j
#SBATCH --error=submit-seq.sh.e%j

USAGE="\n USAGE: ./submit-seq.sh program\n"

if (test $# -ne 1)
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

PROG=$1
make $PROG

export size=32768
export sort_size=1024
export merge_size=1024

./$PROG -n $size -s $sort_size -m $merge_size > ${PROG}_seq_${HOST}.times.txt
more ${PROG}_seq_${HOST}.times.txt
