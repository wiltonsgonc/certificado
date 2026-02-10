@echo off
cd /d "%~dp0"  
echo Servidor HTTP iniciado. 
echo Para abrir a aplicacao, digite em seu navegador: localhost:8000
echo Pressione Ctrl + C para finalizar o servico.
python3 -m http.server
pause
