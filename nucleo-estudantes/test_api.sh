#!/bin/bash
# Script de teste da API de autenticação - Núcleo dos Estudantes UCM

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
API_URL="${1:-http://localhost/api/auth/login}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Teste de Autenticação - Email Institucional${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "API URL: ${YELLOW}$API_URL${NC}\n"

# Testes de credenciais válidas
test_login() {
    local email=$1
    local senha=$2
    local descricao=$3
    
    echo -e "${BLUE}═══ Teste: $descricao ${NC}"
    echo -e "Email: ${YELLOW}$email${NC}"
    echo -e "Senha: ${YELLOW}$senha${NC}"
    
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$senha\"
        }")
    
    # Verificar se teve sucesso
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ LOGIN BEM-SUCEDIDO${NC}"
        echo -e "Resposta: ${GREEN}$response${NC}\n"
    else
        echo -e "${RED}✗ LOGIN FALHOU${NC}"
        echo -e "Resposta: ${RED}$response${NC}\n"
    fi
}

# Teste 1: Membro Regular
test_login "705231198@ucm.ac.mz" "senha123" "Membro Regular - João Pedro"

# Teste 2: Outro Membro
test_login "704521456@ucm.ac.mz" "senha123" "Membro Regular - Maria Silva"

# Teste 3: Administrador
test_login "706789123@ucm.ac.mz" "admin123" "Administrador - Carlos"

# Teste 4: Senha Incorreta
test_login "705231198@ucm.ac.mz" "senhaerrada" "Teste com Senha Incorreta"

# Teste 5: Email Inválido
test_login "invalido@gmail.com" "senha123" "Teste com Email Inválido"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testes Concluídos${NC}"
echo -e "${BLUE}========================================${NC}"
