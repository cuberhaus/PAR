# Stage 1: Compile C → WASM using Emscripten
FROM emscripten/emsdk:3.1.64 AS wasm-build
WORKDIR /build
COPY wasm-src/ ./wasm-src/
RUN mkdir -p web/public/wasm && \
    cd wasm-src && make

# Stage 2: Build Preact frontend
FROM node:22-alpine AS web-build
WORKDIR /app
COPY web/package.json web/package-lock.json* ./
RUN npm ci
COPY web/ ./
COPY --from=wasm-build /build/web/public/wasm/ ./public/wasm/
RUN npm run build

# Stage 3: Serve with nginx
FROM nginx:alpine
COPY --from=web-build /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 8089;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(wasm)$ {
        types { application/wasm wasm; }
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \.(js|css|svg|png|jpg|ico)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF
EXPOSE 8089
