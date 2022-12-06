# C compiler
OMPC    = icc # gcc
OPT2 	= -O2 -fp-model precise
OPTG0 	= -O0
CFLAGS  = -g -std=c99 -Wall
OPENMP	= -fopenmp
NOPENMP = -qopenmp_stubs
LFLAGS  = -lm
CINCL    = -I.
CLIBS    = -L.

.PHONY: multisort-seq multisort-omp multisort-tareador

# Tareador compiler
TAREADORCC = tar-clang
TAREADOR_FLAGS = -tareador-lite
#TAREADOR_FLAGS = -tareador-lite -isystem/scratch/nas/1/par0/Soft

TARGETS	= multisort-seq multisort-tareador multisort-omp
all: $(TARGETS)

kernels.o: kernels.c
	$(OMPC) -c $(CFLAGS) $(OPT2) $^ -o $@

multisort-seq: multisort.c kernels.o
	$(OMPC) $(CFLAGS) $(OPT2) $(NOPENMP) $+ $(LFLAGS) -o $@

multisort-tareador: multisort-tareador.c kernels-tareador.c
	@schroot -p -c tareador make multisort_tareador_env

multisort_tareador_env: multisort-tareador.c kernels-tareador.c
	$(TAREADORCC) $(TAREADOR_FLAGS) $(CFLAGS) $(OPTG0) $+ $(CINCL) $(LFLAGS) -o multisort-tareador $(CLIBS)

multisort-omp: multisort-omp.c  kernels.o
	$(OMPC) $(CFLAGS) $(OPT2) $(OPENMP) $+ $(LFLAGS) -o $@

clean:
	rm -fr $(TARGETS) *.o .tareador_precomputed* *.log

ultraclean:
	rm -fr $(TARGETS) *.o .tareador_precomputed* *.prv *.pcf *.row dependency_graph* *.times.txt *.sh.e* *.sh.o* *.ps *.txt *.log TRACE.* set-0 logs multisort-omp-strong-extrae

