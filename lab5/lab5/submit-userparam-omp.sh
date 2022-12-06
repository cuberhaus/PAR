#!/bin/bash

#SBATCH --job-name=submit-userparam-omp.sh
#SBATCH -D .
#SBATCH --output=submit-userparam-omp.sh.o%j
#SBATCH --error=submit-userparam-omp.sh.e%j

USAGE="\n USAGE: ./submit-userparam-omp.sh numthreads \n
    numthreads  -> Number of threads in parallel execution \n"

if (test $# -lt 1 || test $# -gt 1)
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

SEQ=heat
PROG=heat-omp

# Make sure that all binaries exist
make $SEQ
make $PROG

export OMP_NUM_THREADS=$1
export OMP_WAIT_POLICY="passive"

values="1 2 3 4 5 6 7 8 9 10 11 12"

i=1
out=$PROG-$OMP_NUM_THREADS-userparam.txt

rm -rf $out
rm -rf ./elapsed.txt
for value in $values
do
    echo $value >> $out
    ./$PROG test.dat -a 1 -n 1000 -s 1022 -u $value >> $out
    result=`cat $out | tail -n 3  | grep "Time"| cut -d':' -f 2`
    echo $i >> ./elapsed.txt
    echo $result >> ./elapsed.txt
    i=`echo $i + 1 | bc -l`
done

i=1
rm -rf ./hash_labels.txt
for value in $values
do
    echo "hash_label at " $i " : " $value >> ./hash_labels.txt
    i=`echo $i + 1 | bc -l`
done

jgraph -P userparam-omp.jgr > $PROG-$OMP_NUM_THREADS-userparam.ps
usuario=`whoami`
fecha=`date`
sed -i -e "s/UUU/$usuario/g" $PROG-$OMP_NUM_THREADS-userparam.ps
sed -i -e "s/FFF/$fecha/g" $PROG-$OMP_NUM_THREADS-userparam.ps
rm -rf ./hash_labels.txt
