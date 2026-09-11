# 📧 Sistema de Autenticação com Email Institucional

## Visão Geral

O novo sistema de autenticação da Área de Membros do Núcleo dos Estudantes UCM utiliza **emails institucionais** baseados no código de cada estudante.

## Formato do Email Institucional

```
CODIGOESTUDANTE@ucm.ac.mz
```

Onde `CODIGOESTUDANTE` é um número de 9 dígitos específico de cada estudante.

### Exemplos Válidos:
- `705231198@ucm.ac.mz`
- `704521456@ucm.ac.mz`
- `706789123@ucm.ac.mz`
- `705100999@ucm.ac.mz`

## Credenciais de Teste

### 1️⃣ Estudante Regular - João Pedro Maputo
- **Email:** `705231198@ucm.ac.mz`
- **Senha:** `senha123`
- **Campus:** Maputo
- **Curso:** Administração Pública
- **Ano:** 3º
- **Perfil:** Membro

### 2️⃣ Estudante Regular - Maria Silva Beira
- **Email:** `704521456@ucm.ac.mz`
- **Senha:** `senha123`
- **Campus:** Beira
- **Curso:** Engenharia Informática
- **Ano:** 2º
- **Perfil:** Membro

### 3️⃣ Administrador - Carlos Nampula
- **Email:** `706789123@ucm.ac.mz`
- **Senha:** `admin123`
- **Campus:** Nampula
- **Curso:** Direito
- **Ano:** 4º
- **Perfil:** Administrador (acesso ao painel admin)

### 4️⃣ Estudante Regular - Fátima Quelimane
- **Email:** `705100999@ucm.ac.mz`
- **Senha:** `senha123`
- **Campus:** Quelimane
- **Curso:** Enfermagem
- **Ano:** 1º
- **Perfil:** Membro

## 🔐 Segurança

### Validações Implementadas:
1. **Formato de Email:** Valida se segue `XXXXXXXXX@ucm.ac.mz`
2. **Dígitos:** O código deve ter 9 dígitos
3. **Simplicidade:** Rejeita códigos muito simples (ex: `111111111`)
4. **Apresentação em Hash:** As senhas são armazenadas usando `password_hash()` do PHP

### Armazenamento:
- Senhas: **Criptografadas com bcrypt**
- Tokens: **Codificados em base64 com expiração de 24h**
- Sessão: **Armazenada em localStorage com segurança**

## 📁 Arquivos Relacionados

### Backend (PHP):
- `/php/estudantes.php` - Classe `EstudantesManager` para gerenciar estudantes
- `/php/api.php` - Endpoint `/api/auth/login` para autenticação
- `/api/config/database.php` - Configurações do banco de dados

### Frontend (JavaScript):
- `/js/auth.js` - Classe `AuthManager` para gerenciar autenticação
- Método: `validarEmailInstitucional()` - Valida formato do email
- Método: `fazerLogin()` - Realiza login com email institucional

### Frontend (HTML):
- `/login.html` - Página de acesso com instruções

### Dados:
- `/database/estudantes.json` - Base de dados de estudantes (criada automaticamente)

## 🚀 Como Usar

### 1. Fazer Login na Área de Membros:
1. Acesse: `http://seu-dominio/login.html`
2. Insira seu email institucional (ex: `705231198@ucm.ac.mz`)
3. Insira sua senha
4. Clique em "Entrar"

### 2. Deslogar:
- Clique no botão "Sair" na Área de Membros ou Painel Admin

### 3. Recuperar Senha:
- Clique em "Esqueceu a senha?" (funcionalidade em desenvolvimento)

## 🔧 Fluxo de Autenticação

```
Cliente (login.html)
    │
    ├─ Insere email (ex: 705231198@ucm.ac.mz)
    ├─ Insere senha
    │
    └─> JavaScript
        │
        ├─ Valida formato de email (regex)
        ├─ Verifica se é @ucm.ac.mz
        │
        └─> Envia POST para /api/auth/login
            │
            └─> Backend (api.php)
                │
                ├─ Inclui EstudantesManager
                ├─ Chama autenticarEstudante()
                │
                └─> EstudantesManager
                    │
                    ├─ Carrega data de estudantes
                    ├─ Valida email institucional
                    ├─ Verifica credenciais com password_verify()
                    ├─ Atualiza último acesso
                    │
                    └─> Retorna token + dados do estudante
                        │
                        └─> Frontend
                            │
                            ├─ Armazena token em localStorage
                            ├─ Armazena dados do estudante
                            │
                            └─> Redireciona para área-membros.html
```

## ⚙️ Configuração

### Adicionar Novo Estudante Manualmente:

Edite `/database/estudantes.json` e adicione:

```json
{
  "700000001": {
    "codigo": "700000001",
    "nome": "Nome do Estudante",
    "email": "700000001@ucm.ac.mz",
    "senha": "senha_em_hash_bcrypt",
    "campus": "Maputo",
    "curso": "Programação",
    "ano": 1,
    "ativo": true,
    "dataCriacao": "2026-02-22 10:30:00",
    "ultimoAcesso": null,
    "perfil": "membro"
  }
}
```

_Nota: Use `password_hash('senha', PASSWORD_DEFAULT)` para gerar o hash da senha_

## 📊 Estrutura de Dados do Estudante

```javascript
{
  "codigo": "705231198",              // Chave única
  "nome": "João Pedro Maputo",        // Nome completo
  "email": "705231198@ucm.ac.mz",     // Email institucional
  "senha": "hash_bcrypt",             // Senha criptografada
  "campus": "Maputo",                 // Campus da UCM
  "curso": "Administração Pública",   // Curso
  "ano": 3,                           // Ano de estudo
  "ativo": true,                      // Status da conta
  "dataCriacao": "2026-02-22 10:30:00", // Quando criou conta
  "ultimoAcesso": "2026-02-22 15:45:00", // Último login
  "perfil": "membro"                  // Tipo: membro, administrador
}
```

## 🎯 Próximas Melhorias

- [ ] Integração com LDAP/Active Directory da UCM
- [ ] Recuperação de senha via email real
- [ ] Autenticação de dois fatores (2FA)
- [ ] Sistema de convites para novos estudantes
- [ ] Dashboard do estudante com histórico de acessos
- [ ] Integração com sistema de matrículas da UCM

## ❓ Dúvidas Frequentes

**P: Posso usar outro email para login?**
R: Não, apenas emails institucionais (@ucm.ac.mz) são aceitos.

**P: Esqueci meu código de estudante. Como recupero?**
R: Entre em contato com a administração da UCM ou núcleo de estudantes.

**P: Minha senha foi perdida. Como reset?**
R: Use a função "Esqueceu a senha?" na página de login (em desenvolvimento).

**P: Posso compartilhar minha conta?**
R: Não é recomendado por questões de segurança.

---

**Última atualização:** 22 de Fevereiro de 2026  
**Desenvolvido para:** Núcleo dos Estudantes - Universidade Católica de Moçambique
