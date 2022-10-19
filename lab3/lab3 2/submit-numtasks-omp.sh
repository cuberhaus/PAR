#!/bin/csh

#SBATCH --job-name=submit-strong-omp.sh
#SBATCH -D .
#SBATCH --output=submit-strong-omp.sh.o%j
#SBATCH --error=submit-strong-omp.sh.e%j

setenv PROG mandel-omp

# Make sure that binary exists
make $PROG

setenv OMP_NUM_THREADS $1
setenv OMP_WAIT_POLICY "passive"

set num_tasks = "1 2 4 8 16 32 64 128 256 512 1024 2048 4096 8192 16384 32768"
set numits = 10000

set i = 1

set out = $PROG-$OMP_NUM_THREADS-numtasks.txt
rm -rf $out
rm -rf ./elapsed.txt
foreach ntasks ( $num_tasks )
	echo $ntasks >> $out
	./$PROG -h -i $numits -u $ntasks >> $out
        set result = `cat $out | tail -n 4  | grep "Total execution time"| cut -d':' -f 2`
	echo $i >> ./elapsed.txt
	echo $result >> ./elapsed.txt
	set i = `echo $i + 1 | bc -l`
end

set i = 1
rm -rf ./hash_labels.txt
foreach ntasks ( $num_tasks )
	echo "hash_label at " $i " : " $ntasks >> ./hash_labels.txt
	set i = `echo $i + 1 | bc -l`
end

jgraph -P ntasks-omp.jgr > $PROG-$OMP_NUM_THREADS-ntasks.ps
set usuario=`whoami`
set fecha=`date`
sed -i -e "s/UUU/$usuario/g" $PROG-$OMP_NUM_THREADS-ntasks.ps
sed -i -e "s/FFF/$fecha/g" $PROG-$OMP_NUM_THREADS-ntasks.ps
rm -rf ./hash_labels.txt
