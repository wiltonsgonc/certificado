# syntax=docker/dockerfile:1
# Stage: build (Linux)
FROM golang:1.20-alpine AS build-linux
WORKDIR /src
RUN apk add --no-cache git ca-certificates
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /out/certificado-linux-amd64 ./main.go

# Stage: build-windows (Windows .exe)
FROM golang:1.20 AS build-windows
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o /out/certificado-windows-amd64.exe ./main.go

# Minimal runtime image for Linux binary (optional runtime image)
FROM scratch AS release-linux
COPY --from=build-linux /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build-linux /out/certificado-linux-amd64 /certificado
EXPOSE 8080
ENTRYPOINT ["/certificado"]