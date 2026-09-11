@echo off
REM iniciar-servidor.bat — inicia servidor PHP embutido na raiz do projeto
SETLOCAL

REM Verificar se php está no PATH
where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo PHP nao encontrado no PATH.
  echo Se estiver usando XAMPP, execute este comando no Prompt de Comando:
  echo    C:\xampp\php\php.exe -S localhost:8000 -t "%~dp0"
  echo Ou adicione o executavel php.exe ao PATH do sistema.
  pause
  exit /b 1
)

echo Iniciando servidor PHP em http://localhost:8000
php -S localhost:8000 -t "%~dp0"@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                SERVIDOR LOCAL - PHP                       ║
echo ║        Núcleo dos Estudantes UCM - Sistema Web           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Verificar se PHP está instalado
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: PHP não está instalado ou não está no PATH
    echo.
    echo Soluções:
    echo 1. Instale XAMPP de: https://www.apachefriends.org
    echo 2. Ou adicione PHP ao PATH do Windows
    echo.
    pause
    exit /b 1
)

REM Obter versão do PHP
php -v

echo.
echo ✓ PHP encontrado!
echo.

REM Trocar para o diretório correto
cd /d "%~dp0"

echo Diretório: %cd%
echo.

REM Iniciar servidor
echo 🚀 Iniciando servidor em http://localhost:8000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  Abra seu navegador e acesse: http://localhost:8000/     ║
echo ║  Pages:                                                   ║
echo ║    - Login: http://localhost:8000/login.html              ║
echo ║    - Home: http://localhost:8000/index.html               ║
echo ║    - Test: http://localhost:8000/como-acessar.html        ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

php -S localhost:8000

echo.
echo Servidor parado.
pause
