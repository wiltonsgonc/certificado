@echo off
cd /d "%~dp0"  
echo Servidor HTTP iniciado. Pressione Ctrl + C para finalizar o servico.
echo Para abrir a aplicacao, digite em seu navegador: localhost:8000
python3 -m http.server
pause
