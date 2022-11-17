#!/bin/bash

#SBATCH --job-name=submit-arch.sh
#SBATCH -D .
#SBATCH --output=submit-arch.sh.o%j
#SBATCH --error=submit-arch.sh.e%j

HOST=$(echo $HOSTNAME | cut -f 1 -d'.')

if [ ${HOST} = 'boada-6' ] || [ ${HOST} = 'boada-7' ] || [ ${HOST} == 'boada-8' ]
then
    echo "Use sbatch to execute this script"
    exit 0
fi

PROG=lscpu
$PROG > ${PROG}-${HOST}

PROG='lstopo'
$PROG > ${PROG}-${HOST}
PROGFIG='lstopo --of fig map.fig'
$PROGFIG
mv map.fig map-${HOST}.fig
