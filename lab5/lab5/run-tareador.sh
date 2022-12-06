USAGE="\n USAGE: ./run_tareador.sh prog \n
        prog        -> Tareador program name\n
        solver      -> 0: Jacobi; 1: Gauss-Seidel\n"

if (test $# -lt 2 || test $# -gt 2)
then
        echo -e $USAGE
        exit 0
fi

filename=$1
shift
rm $filename
make $filename
options=$@
rm -rf .tareador_precomputed_$1
schroot -p -c tareador bash run-lite-tareador.sh -- $filename "$options"
