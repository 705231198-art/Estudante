# Script de teste da API de autenticação - Núcleo dos Estudantes UCM
# Para executar no Windows PowerShell

param(
    [string]$ApiUrl = "http://localhost/api/auth/login"
)

Write-Host "======================================" -ForegroundColor Blue
Write-Host "Teste de Autenticação - Email Institucional" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host "API URL: $ApiUrl`n" -ForegroundColor Yellow

# Função para testar login
function Test-Login {
    param(
        [string]$Email,
        [string]$Senha,
        [string]$Descricao
    )
    
    Write-Host "════ Teste: $Descricao" -ForegroundColor Blue
    Write-Host "Email: $Email" -ForegroundColor Yellow
    Write-Host "Senha: $Senha" -ForegroundColor Yellow
    
    $body = @{
        email = $Email
        password = $Senha
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $ApiUrl -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body -ErrorAction Stop
        
        if ($response.success -eq $true) {
            Write-Host "✓ LOGIN BEM-SUCEDIDO" -ForegroundColor Green
            Write-Host "Estudante: $($response.estudante.nome)" -ForegroundColor Green
            Write-Host "Perfil: $($response.estudante.perfil)" -ForegroundColor Green
            Write-Host "Campus: $($response.estudante.campus)" -ForegroundColor Green
        } else {
            Write-Host "✗ LOGIN FALHOU" -ForegroundColor Red
            Write-Host "Erro: $($response.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ ERRO NA REQUISIÇÃO" -ForegroundColor Red
        Write-Host "Detalhes: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Teste 1: Membro Regular - João Pedro
Test-Login -Email "705231198@ucm.ac.mz" -Senha "senha123" -Descricao "Membro Regular - João Pedro"

# Teste 2: Outro Membro - Maria Silva
Test-Login -Email "704521456@ucm.ac.mz" -Senha "senha123" -Descricao "Membro Regular - Maria Silva"

# Teste 3: Administrador - Carlos
Test-Login -Email "706789123@ucm.ac.mz" -Senha "admin123" -Descricao "Administrador - Carlos"

# Teste 4: Membro - Fátima
Test-Login -Email "705100999@ucm.ac.mz" -Senha "senha123" -Descricao "Membro Regular - Fátima"

# Teste 5: Senha Incorreta
Test-Login -Email "705231198@ucm.ac.mz" -Senha "senhaerrada" -Descricao "Teste com Senha Incorreta"

# Teste 6: Email Inválido (não @ucm.ac.mz)
Test-Login -Email "invalido@gmail.com" -Senha "senha123" -Descricao "Teste com Email Inválido"

# Teste 7: Formato de Email Inválido
Test-Login -Email "usuario@ucm.ac.mz" -Senha "senha123" -Descricao "Teste com Formato de Email Inválido"

Write-Host "======================================" -ForegroundColor Blue
Write-Host "Testes Concluídos" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
