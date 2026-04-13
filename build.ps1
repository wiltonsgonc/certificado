Param()

$ErrorActionPreference = "Stop"
$OutDir = "out"
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

# detect tool: prefer podman, fallback docker
$tool = $null
if (Get-Command podman -ErrorAction SilentlyContinue) { $tool = "podman" }
elseif (Get-Command docker -ErrorAction SilentlyContinue) { $tool = "docker" }
else { Write-Error "No podman or docker found in PATH."; exit 1 }

Write-Host ("Using: " + $tool)

# Ensure go.mod exists (init if missing) inside a temporary golang container
if (-not (Test-Path "go.mod")) {
    Write-Host "go.mod not found - initializing module inside golang container..."
    $cmd = 'bash -lc "if [ ! -f go.mod ]; then go mod init certificado; fi; go mod tidy"'
    & $tool run --rm -v "${PWD}:/src" -w /src docker.io/library/golang:1.26 $cmd
}

# Build the final release image (optional) and also build stages for extraction
Write-Host "Building release image (release-linux stage)..."
& $tool build -t temp-certificado-build .

# Build each build stage separately so we can extract /out from them
Write-Host "Building build-linux stage..."
& $tool build --target build-linux -t temp-build-linux .

Write-Host "Building build-windows stage..."
& $tool build --target build-windows -t temp-build-windows .

Write-Host "Building build-darwin-arm64 stage..."
& $tool build --target build-darwin-arm64 -t temp-build-darwin-arm64 .

# Extract from build-linux
Write-Host "Extracting certificado-linux-amd64 from temp-build-linux..."
$cid1 = (& $tool create temp-build-linux)
if (-not $cid1) { Write-Error "Failed to create temp-build-linux container."; exit 1 }
try {
    & $tool cp ("${cid1}:/out/certificado-linux-amd64") ("$OutDir\certificado-linux-amd64") 2>$null
    if ($LASTEXITCODE -ne 0) { Write-Warning "certificado-linux-amd64 not found in temp-build-linux." }
} finally {
    Write-Host "Removing temp-build-linux container..."
    & $tool rm -v $cid1 | Out-Null
}

# Extract from build-windows
Write-Host "Extracting certificado-windows-amd64.exe from temp-build-windows..."
$cid2 = (& $tool create temp-build-windows)
if (-not $cid2) { Write-Error "Failed to create temp-build-windows container."; exit 1 }
try {
    & $tool cp ("${cid2}:/out/certificado-windows-amd64.exe") ("$OutDir\certificado-windows-amd64.exe") 2>$null
    if ($LASTEXITCODE -ne 0) { Write-Warning "certificado-windows-amd64.exe not found in temp-build-windows." }
} finally {
    Write-Host "Removing temp-build-windows container..."
    & $tool rm -v $cid2 | Out-Null
}

# Extract from build-darwin-arm64
Write-Host "Extracting certificado-darwin-arm64 from temp-build-darwin-arm64..."
$cid3 = (& $tool create temp-build-darwin-arm64)
if (-not $cid3) { Write-Error "Failed to create temp-build-darwin-arm64 container."; exit 1 }
try {
    & $tool cp ("${cid3}:/out/certificado-darwin-arm64") ("$OutDir\certificado-darwin-arm64") 2>$null
    if ($LASTEXITCODE -ne 0) { Write-Warning "certificado-darwin-arm64 not found in temp-build-darwin-arm64." }
} finally {
    Write-Host "Removing temp-build-darwin-arm64 container..."
    & $tool rm -v $cid3 | Out-Null
}

Write-Host ("Build finished. Binaries in: " + $OutDir)
Get-ChildItem $OutDir -Force