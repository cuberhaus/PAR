#!/bin/bash
filename=$1
shift
options=$@
echo "filename:$filename"
echo "options:$options"
source /Soft/PAR/environment.bash
rm -rf .tareador_precomputed_$filename
tareador_gui.py --llvm --lite $filename -b "$options"
