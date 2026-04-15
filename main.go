package main

import (
	"embed"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os/exec"
	"runtime"
	"strings"
	"path"
)

//go:embed dist/*
var embedded embed.FS

func spaHandler(root fs.FS) http.Handler {
	sub, err := fs.Sub(root, "dist")
	if err != nil {
		log.Fatalf("fs.Sub: %v", err)
	}
	fileServer := http.FileServer(http.FS(sub))

	// preload index.html bytes for fallback
	indexBytes, _ := fs.ReadFile(sub, "index.html")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.Contains(r.URL.Path, "..") {
			http.Error(w, "invalid path", http.StatusBadRequest)
			return
		}

		p := path.Clean(r.URL.Path)
		if p == "/" {
			p = "/index.html"
		}

		// try to open requested file; if not found, serve index.html
		name := strings.TrimPrefix(p, "/")
		if _, err := sub.Open(name); err != nil {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			_, _ = w.Write(indexBytes)
			return
		}

		fileServer.ServeHTTP(w, r)
	})
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	_ = cmd.Start()
}

func main() {
	port := "8080"
	addr := ":" + port
	handler := spaHandler(embedded)
	http.Handle("/", handler)

	url := "http://localhost:" + port + "/"
	go func() {
		// simple wait loop until server responds
		for i := 0; i < 10; i++ {
			resp, err := http.Get(url)
			if err == nil {
				io.Copy(io.Discard, resp.Body)
				resp.Body.Close()
				openBrowser(url)
				return
			}
		}
		openBrowser(url)
	}()

	fmt.Printf("Servindo em %s\n", url)
	fmt.Printf("Pressione Ctrl + C para encerrar o programa.")
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("erro ao iniciar servidor: %v", err)
	}
}