#!/bin/bash

#SBATCH --job-name=submit-cutoff-omp.sh
#SBATCH -D .
#SBATCH --output=submit-cutoff-omp.sh.o%j
#SBATCH --error=submit-cutoff-omp.sh.e%j

USAGE="\n USAGE: ./submit-cutoff-omp.sh numthreads \n
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

SEQ=multisort-seq
PROG=multisort-omp

# Make sure that all binaries exist
make $SEQ
make $PROG

export OMP_NUM_THREADS=$1
export OMP_WAIT_POLICY="passive"

size=32768
sort_size=128
merge_size=128
depth_list="0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"

i=1
out=$PROG-$OMP_NUM_THREADS-cutoff.txt

rm -rf $out
rm -rf ./elapsed.txt
for depth in $depth_list
do
    ./$PROG -n $size -s $sort_size -m $merge_size -c $depth >> $out
    result=`cat $out | tail -n 4  | grep "Multisort execution time"| cut -d':' -f 2`
    echo $depth >> ./elapsed.txt
    echo $result >> ./elapsed.txt
    i=`echo $i + 1 | bc -l`
done

i=0
rm -rf ./hash_labels.txt
for depth in $depth_list
do
    echo "hash_label at " $i " : " $depth >> ./hash_labels.txt
    i=`echo $i + 1 | bc -l`
done

jgraph -P .cutoff-omp.jgr > $PROG-$OMP_NUM_THREADS-cutoff.ps
usuario=`whoami`
fecha=`date`
sed -i -e "s/UUU/$usuario/g" $PROG-$OMP_NUM_THREADS-cutoff.ps
sed -i -e "s/FFF/$fecha/g" $PROG-$OMP_NUM_THREADS-cutoff.ps
rm -rf ./hash_labels.txt
