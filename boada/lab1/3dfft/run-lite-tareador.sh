#!/bin/bash
source /Soft/PAR/environment.bash
rm -rf .tareador_precomputed_*
tareador_gui.py --llvm --lite $1
