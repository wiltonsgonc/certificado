#!/usr/bin/env bash
set -euo pipefail

OUTDIR=out
mkdir -p "$OUTDIR"

# build Linux amd64
docker build --target build-linux -t temp-build-linux .
CONTAINER_ID=$(docker create temp-build-linux true)
docker cp "$CONTAINER_ID":/out/certificado-linux-amd64 "$OUTDIR"/certificado-linux-amd64
docker rm "$CONTAINER_ID"

# build Windows amd64
docker build --target build-windows -t temp-build-windows .
CONTAINER_ID=$(docker create temp-build-windows true)
docker cp "$CONTAINER_ID":/out/certificado-windows-amd64.exe "$OUTDIR"/certificado-windows-amd64.exe
docker rm "$CONTAINER_ID"

echo "Binaries written to $OUTDIR/"
ls -la "$OUTDIR"