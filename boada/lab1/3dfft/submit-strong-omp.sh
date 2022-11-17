#!/bin/bash

#SBATCH --job-name=submit-strong-omp.sh
#SBATCH -D .
#SBATCH --output=submit-strong-omp.sh.o%j
#SBATCH --error=submit-strong-omp.sh.e%j

SEQ=3dfft_seq
PROG=3dfft_omp
np_NMIN=1
np_NMAX=20
N=3

# Make sure that all binaries exist
make clean
make $SEQ
make $PROG

HOST=$(echo $HOSTNAME | cut -f 1 -d'.')

if [ ${HOST} = 'boada-6' ] || [ ${HOST} = 'boada-7' ] || [ ${HOST} == 'boada-8' ]
then
    echo "Use sbatch to execute this script"
    exit 0
fi

USUARIO=`whoami`
FECHA=`date`

out=/tmp/out.$$	    # Temporal file where you save the execution results

outputpath=./elapsed-${HOST}.txt
outputpath2=./speedup-${HOST}.txt
rm -rf $outputpath 2> /dev/null
rm -rf $outputpath2 2> /dev/null

#export OMP_PROC_BIND=true
export KMP_AFFINITY=scatter

echo Executing $SEQ sequentially
min_elapsed=1000  # Minimo del elapsed time de las N ejecuciones del programa
i=0        # Variable contador de repeticiones
while (test $i -lt $N)
	do
		echo -n Run $i...
		/usr/bin/time -f "%e" ./$SEQ > /dev/null 2> $out

		time=`cat $out|tail -n 1`
		echo Elapsed time = `cat $out`

                st=`echo "$time < $min_elapsed" | bc`
                if [ $st -eq 1 ]; then
                   min_elapsed=$time
                fi

		rm -f $out
		i=`expr $i + 1`
	done
echo -n ELAPSED TIME MIN OF $N EXECUTIONS =
sequential=`echo $min_elapsed`
echo $sequential
echo

echo "$PROG $np_NMIN $np_NMAX $N"

i=0
echo "Starting OpenMP executions..."

PARS=$np_NMIN
while (test $PARS -le $np_NMAX)
do
	echo Executing $PROG with $PARS threads
    min_elapsed=1000  # Minimo del elapsed time de las N ejecuciones del programa

	while (test $i -lt $N)
		do
			echo -n Run $i...
            export OMP_NUM_THREADS=$PARS
			/usr/bin/time -f "%e" ./$PROG > /dev/null 2> $out

            time=`cat $out|tail -n 1`
			echo Elapsed time = `cat $out`

            st=`echo "$time < $min_elapsed" | bc`
            if [ $st -eq 1 ]; then
               min_elapsed=$time;
            fi

			rm -f $out
			i=`expr $i + 1`
		done

	echo -n ELAPSED TIME MIN OF $N EXECUTIONS =

    min=`echo $min_elapsed`
    result=`echo $sequential/$min|bc -l`
    echo $min
	echo
	i=0

    	#output PARS i elapsed time minimo en fichero elapsed time
	echo -n $PARS >> $outputpath
	echo -n "   " >> $outputpath
    echo $min     >> $outputpath

    	#output PARS i speedup en fichero speedup
	echo -n $PARS >> $outputpath2
	echo -n "   " >> $outputpath2
    echo $result  >> $outputpath2

    	#incrementa el parametre
	PARS=`expr $PARS + 1`
done

echo "Resultat de l'experiment (tambe es troben a " $outputpath " i " $outputpath2 " )"
echo "#threads	Elapsed min"
cat $outputpath
echo
echo "#threads	Speedup"
cat $outputpath2
echo

cp .strong-omp.jgr strong-omp-${HOST}.jgr
sed -i -e "s/HHH/${HOST}/g" strong-omp-${HOST}.jgr

sed -i -e "s/UUU/${USUARIO}/g" strong-omp-${HOST}.jgr
sed -i -e "s/FFF/${FECHA}/g" strong-omp-${HOST}.jgr
jgraph -P strong-omp-${HOST}.jgr > $PROG-$np_NMIN-$np_NMAX-$N-strong-${HOST}.ps
rm strong-omp-${HOST}.jgr

