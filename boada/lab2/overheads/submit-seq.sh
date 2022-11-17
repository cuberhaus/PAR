#!/bin/bash

#SBATCH --job-name=submit-seq.sh
#SBATCH -D .
#SBATCH --output=submit-seq.sh.o%j
#SBATCH --error=submit-seq.sh.e%j

USAGE="\n USAGE: submit-seq.sh PROG size n_th\n
        PROG   -> program name\n
        size   -> size of the problem\n"

if (test $# -lt 2 || test $# -gt 2)
then
	echo -e $USAGE
        exit 0
fi

make $1

HOST=$(echo $HOSTNAME | cut -f 1 -d'.')

if [ ${HOST} = 'boada-6' ] || [ ${HOST} = 'boada-7' ] || [ ${HOST} == 'boada-8' ]
then
        echo "Use sbatch to execute this script"
        exit 0
fi

./$1 $2 > $1-$2-${HOST}.txt
