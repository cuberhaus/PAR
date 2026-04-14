# PAR — Parallel Computing Labs (Web Frontend)
# Build targets for WASM compilation and Preact development

.PHONY: wasm dev build docker clean

# Compile C kernels → WASM via Emscripten
wasm:
	$(MAKE) -C wasm-src

# Start Vite dev server on port 8089
dev: wasm
	cd web && npm run dev

# Production build
build: wasm
	cd web && npm run build

# Install web dependencies
install:
	cd web && npm install

# Docker
docker:
	docker compose up -d

docker-build:
	docker compose build

# Run tests
test:
	cd web && npm run test

# Clean
clean:
	$(MAKE) -C wasm-src clean
	rm -rf web/dist
