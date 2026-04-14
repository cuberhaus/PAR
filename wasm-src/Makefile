# WASM build for PAR lab kernels
# Requires: Emscripten SDK (emcc on PATH)
# Output goes to ../web/public/wasm/

CC      = emcc
CFLAGS  = -O2 -std=c99
OUTDIR  = ../web/public/wasm

# Common Emscripten flags
EM_FLAGS = \
	-s MODULARIZE=1 \
	-s EXPORT_ES6=1 \
	-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s ENVIRONMENT='web,worker'

TARGETS = $(OUTDIR)/mandel.js $(OUTDIR)/solver.js $(OUTDIR)/pi.js $(OUTDIR)/multisort.js

.PHONY: all clean dirs

all: dirs $(TARGETS)

dirs:
	@mkdir -p $(OUTDIR)

$(OUTDIR)/mandel.js: mandel-wasm.c
	$(CC) $(CFLAGS) $(EM_FLAGS) \
		-s EXPORTED_FUNCTIONS='["_compute_mandelbrot","_compute_mandelbrot_row","_malloc","_free"]' \
		-o $@ $<

$(OUTDIR)/solver.js: solver-wasm.c
	$(CC) $(CFLAGS) $(EM_FLAGS) \
		-s EXPORTED_FUNCTIONS='["_jacobi_step","_copy_mat","_init_grid","_malloc","_free"]' \
		-o $@ $<

$(OUTDIR)/pi.js: pi-wasm.c
	$(CC) $(CFLAGS) $(EM_FLAGS) \
		-s EXPORTED_FUNCTIONS='["_compute_pi","_compute_pi_slice","_malloc","_free"]' \
		-o $@ $<

$(OUTDIR)/multisort.js: multisort-wasm.c
	$(CC) $(CFLAGS) $(EM_FLAGS) \
		-s EXPORTED_FUNCTIONS='["_multisort","_initialize","_check_sorted","_malloc","_free"]' \
		-o $@ $<

clean:
	rm -f $(OUTDIR)/mandel.{js,wasm} $(OUTDIR)/solver.{js,wasm} \
	      $(OUTDIR)/pi.{js,wasm} $(OUTDIR)/multisort.{js,wasm}
