#!/bin/bash

#SBATCH --job-name=submit-strong-extrae.sh
#SBATCH -D .
#SBATCH --output=submit-strong-extrae.sh.o%j
#SBATCH --error=submit-strong-extrae.sh.e%j

USAGE="\n USAGE: ./submit-strong-extrae.sh prog \n
        prog        -> Program name\n"

if (test $# -lt 1 || test $# -gt 1)
then
        echo -e $USAGE
        exit 0
fi

make clean
make $1

HOST=$(echo $HOSTNAME | cut -f 1 -d'.')

if [ ${HOST} = 'boada-6' ] || [ ${HOST} = 'boada-7' ] || [ ${HOST} == 'boada-8' ]
then
    echo "Use sbatch to execute this script"
    exit 0
fi

export np_MIN=1
export np_MAX=16
export np_STEP=4

#Preparing the directory that will receive all pre-processed traces
rm -rf $1-strong-extrae
mkdir $1-strong-extrae

P=$np_MIN
while (test $P -le $np_MAX)
do
    echo Tracing $1 with $P threads

    #Tracing the application with P threads
    export OMP_NUM_THREADS=$P
    export LD_PRELOAD=${EXTRAE_HOME}/lib/libomptrace.so
    ./$1
    unset LD_PRELOAD

    #Generating the trace
    mpi2prv -f TRACE.mpits -o $1-strong-extrae/$1-$P-${HOST}.prv -e $1 -paraver
    rm -rf  TRACE.mpits set-0 >& /dev/null

    #Finding the trace limits as delimited by the initial and final "fake" parallel region
    start=$(grep 60000001 $1-strong-extrae/$1-$P-${HOST}.prv | head -n2 | tail -n1 | cut -d ":" -f 6)
    start=$((start+1))
    end=$(grep 60000001 $1-strong-extrae/$1-$P-${HOST}.prv | tail -n2 | head -n1 | cut -d ":" -f 6)
    end=$((end-1))

    #Generating the xml file for cutting the original trace
    cp $BASICANALYSIS_HOME/.cutter.xml $1-strong-extrae/cutter-$P.xml
    sed -i -e "s/LLL/$start/g" $1-strong-extrae/cutter-$P.xml
    sed -i -e "s/UUU/$end/g" $1-strong-extrae/cutter-$P.xml

    #Cutting the trace for proper analysis
    paramedir $1-strong-extrae/$1-$P-${HOST}.prv -c $1-strong-extrae/cutter-$P.xml -o $1-strong-extrae/$1-$P-${HOST}-cutter.prv
    rm $1-strong-extrae/$1-$P-${HOST}.*
    rm $1-strong-extrae/cutter-$P.xml

    #Find the next number of threads
    if (test $P -eq 1) then
        P=4;
    else
        P=`expr $P + $np_STEP`
    fi
done

#Running modelfactors as is
cd $1-strong-extrae
modelfactors.py -pf $1-*-cutter.prv > modelfactors.out
../table-generation.sh
pdflatex ../modelfactor-tables.tex
rm -rf scratch_out_basicanalysis
