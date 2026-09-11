@echo off
REM ============================================================================
REM Instalador Automático - Base de Dados MySQL para Núcleo dos Estudantes UCM
REM Para XAMPP no Windows
REM ============================================================================

echo.
echo ============================================================================
echo Instalador do Banco de Dados - Nucleó dos Estudantes UCM
echo ============================================================================
echo.

REM Detectar localização do XAMPP
set XAMPP_PATH=C:\xampp
set MYSQL_BIN=%XAMPP_PATH%\mysql\bin\mysql.exe
set MYSQL_DATA=%XAMPP_PATH%\mysql\data

REM Verificar se XAMPP existe
if not exist "%MYSQL_BIN%" (
    echo ❌ XAMPP não encontrado em C:\xampp
    echo.
    echo Opções:
    echo 1. Verifique se XAMPP está instalado em C:\xampp
    echo 2. Se estiver em outro local, edite este arquivo e atualize XAMPP_PATH
    echo.
    pause
    exit /b 1
)

echo ✓ XAMPP encontrado em %XAMPP_PATH%
echo.

REM Pedir confirmação
echo ============================================================================
echo ATENÇÃO: Este script vai:
echo   1. Criar base de dados 'nucleoucm_db'
echo   2. Criar usuário 'nucleoucm_user'
echo   3. Criar todas as tabelas necessárias
echo   4. Inserir dados de teste
echo ============================================================================
echo.
echo Certifique-se de que MySQL está rodando (XAMPP Control Panel)
echo.
set /p CONFIRM="Deseja continuar? (S/N): "

if /i not "%CONFIRM%"=="S" (
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo Executando SQL...
echo.

REM Executar o arquivo SQL
"%MYSQL_BIN%" -u root < "%~dp0nucleoucm_base.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================================
    echo ✓ Instalação Bem-Sucedida!
    echo ============================================================================
    echo.
    echo Próximos passos:
    echo.
    echo 1. Gerar Hashes das Senhas:
    echo    Abra: http://localhost/nucleo-estudantes/gerar_hashes.php
    echo    Clique em "Gerar Hashes Bcrypt"
    echo    Copie o SQL gerado
    echo.
    echo 2. Insira os Dados de Teste:
    echo    Abra phpMyAdmin: http://localhost/phpmyadmin
    echo    Selecione 'nucleoucm_db'
    echo    Clique em SQL
    echo    Cole o SQL gerado e execute
    echo.
    echo 3. Teste o Login:
    echo    http://localhost/nucleo-estudantes/login.html
    echo    Email: 705231198@ucm.ac.mz
    echo    Senha: 705231198@2026
    echo.
    echo ============================================================================
    echo.
) else (
    echo.
    echo ============================================================================
    echo ❌ Erro na Instalação!
    echo ============================================================================
    echo.
    echo Possíveis causas:
    echo   - MySQL não está rodando
    echo   - Arquivo SQL não foi encontrado
    echo   - Erro de permissões
    echo.
    echo Tente:
    echo   1. Inicie MySQL no XAMPP Control Panel
    echo   2. Teste a conexão: %MYSQL_BIN% -u root
    echo   3. Verifique o arquivo: nucleoucm_base.sql
    echo.
)

pause
