#!/usr/bin/env bash
set -euo pipefail

OUTDIR=out
mkdir -p "$OUTDIR"

# build Linux amd64 (static)
docker build --target build --build-arg CGO_ENABLED=0 -t temp-certificado-build .

# copiar binário gerado no estágio build
CONTAINER_ID=$(docker create temp-certificado-build true)
docker cp "$CONTAINER_ID":/out/certificado-linux-amd64 "$OUTDIR"/certificado-linux-amd64
docker rm "$CONTAINER_ID"

# build Windows amd64 using buildx (cross-compile)
# usa imagem golang para compilar com GOOS=windows
docker run --rm -v "$(pwd)":/src -w /src golang:1.26 bash -c "CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags='-s -w' -o /src/$OUTDIR/certificado-windows-amd64.exe ./main.go"

echo "Binaries written to $OUTDIR/"
ls -la "$OUTDIR"