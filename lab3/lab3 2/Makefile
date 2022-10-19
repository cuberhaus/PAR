# C compiler
OMPC    = icc
OPT3 	= -g -O3 -fp-model precise
OPTG0 	= -g -O0
CFLAGS  = -std=c99 # -Wall
OPENMP	= -fopenmp
LFLAGS  = -lX11 -L/usr/X11R6/lib
CINCL    = -I.
CLIBS    = -L.

# Tareador compiler
TAREADORCC = tar-clang
TAREADOR_FLAGS = -tareador-lite -isystem/scratch/nas/1/par0/Soft

TARGETS  = mandel-seq mandel-tar mandel-omp
all: $(TARGETS)

mandel-seq: mandel-seq.c
	$(OMPC) -o $@ $(OPT3) $(CFLAGS) $^ $(LFLAGS)

mandel-tar: mandel-tar.c
	@schroot -p -c tareador make mandel_tar_env

mandel_tar_env:	mandel-tar.c
	$(TAREADORCC) $(OPTG0) $(TAREADOR_FLAGS) $(CFLAGS) $(CINCL) $< -o mandel-tar $(CLIBS) $(LFLAGS)

mandel-omp: mandel-omp.c
	$(OMPC) -o $@ $(OPT3) $(CFLAGS) $(OPENMP) $^ $(LFLAGS)

clean:
	rm -rf $(TARGETS) .tareador_precomputed* logs *.log

ultraclean:
	rm -rf $(TARGETS) .tareador_precomputed* logs *.log *.prv *.pcf *.row dependency_graph* time-mandel* *.sh.o* *.sh.e* elapsed.txt speedup.txt hash_labels.txt TRACE.sym TRACE.mpits set-0 *.ps *.out *.txt mandel-omp-strong-extrae
