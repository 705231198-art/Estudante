# 🔑 INSTRUÇÕES DE TESTE - Autenticação com Email Institucional

## ✅ Sistema Implementado

O sistema de autenticação da Área de Membros foi atualizado para usar **emails institucionais** baseados no código de estudante da UCM.

### Mudanças Realizadas:

1. ✅ **Backend (PHP)**
   - Criado: `/php/estudantes.php` - Classe `EstudantesManager`
   - Modificado: `/php/api.php` - Endpoint `/api/auth/login` atualizado
   - Base de dados: `/database/estudantes.json`

2. ✅ **Frontend (JavaScript)**
   - Modificado: `/js/auth.js` 
   - Nova validação: `validarEmailInstitucional()`
   - Autenticação contra servidor API

3. ✅ **Interface (HTML)**
   - Modificado: `/login.html`
   - Adicionadas dicas de uso do email institucional

## 🧪 Teste Local (XAMPP)

### Pré-requisitos:
- XAMPP instalado
- PHP 7.4+
- Navegador web

### Passos:

1. **Copiar projeto para htdocs:**
   ```
   C:\xampp\htdocs\nucleo-estudantes\
   ```

2. **Iniciar XAMPP:**
   - Apache: ✅ On
   - MySQL: (opcional, não estamos usando por enquanto)

3. **Acessar aplicação:**
   ```
   http://localhost/nucleo-estudantes/login.html
   ```

4. **Testar login com credenciais:**

   **Teste 1 - Membro Regular:**
   ```
   Email:  705231198@ucm.ac.mz
   Senha:  senha123
   ```
   Resultado esperado: Redireciona para `area-membros.html`

   **Teste 2 - Administrador:**
   ```
   Email:  706789123@ucm.ac.mz
   Senha:  admin123
   ```
   Resultado esperado: Redireciona para `admin.html`

## 🟦 Teste em Servidor Real

### Requisitos:
- Hospedagem com PHP 7.4+
- Permissões de escrita na pasta `/database/`
- HTTPS (recomendado)

### Configuração:

1. **Upload dos arquivos:**
   ```
   public_html/
   ├── index.html
   ├── login.html
   ├── area-membros.html
   ├── admin.html
   ├── api/
   │   └── index.php
   ├── php/
   │   ├── api.php
   │   ├── estudantes.php
   │   └── send-email.php
   ├── database/
   │   └── estudantes.json
   ├── js/
   │   ├── auth.js
   │   ├── script.js
   │   └── api.js
   ├── css/
   │   └── *.css
   └── images/
       └── ...
   ```

2. **Testes:**
   ```
   https://seu-dominio.ac.mz/login.html
   ```

## 🔍 Testes de Validação

### Email Institucional:

✅ **Válidos:**
- `705231198@ucm.ac.mz`
- `704521456@ucm.ac.mz`
- `706789123@ucm.ac.mz`

❌ **Inválidos:**
- `usuario@ucm.ac.mz` (não é numérico)
- `70523119@ucm.ac.mz` (menos de 9 dígitos)
- `7052311987@ucm.ac.mz` (mais de 9 dígitos)
- `111111111@ucm.ac.mz` (dígitos repetidos)
- `usuario@gmail.com` (não é domínio @ucm.ac.mz)
- `705231198@yahoo.com` (domínio errado)

### Senha:

✅ **Válidas:**
- Mínimo 6 caracteres
- Pode conter letras, números e símbolos

❌ **Inválidas:**
- Menos de 6 caracteres
- Campo vazio

## 📊 Fluxo de Autenticação

```
1. Usuário preenche formulário
   ├─ Email: 705231198@ucm.ac.mz
   └─ Senha: senha123

2. JavaScript valida email
   ├─ Verifica formato (regex)
   └─ Verifica domínio @ucm.ac.mz

3. Envia POST para /api/auth/login
   └─ Headers: Content-Type: application/json
   └─ Body: { email, password }

4. Backend processa
   ├─ Inclui EstudantesManager
   ├─ Valida novamente email
   ├─ Verifica credenciais com password_verify()
   └─ Retorna token + dados do estudante

5. Frontend recebe resposta
   ├─ Salva token em localStorage
   ├─ Salva dados do estudante
   └─ Redireciona para área-membros.html
```

## 📝 Dados de Teste

Todos os estudantes têm senha: **`senha123`** (exceto administrador: **`admin123`**)

| Código | Nome | Campus | Curso | Ano | Email | Perfil |
|--------|------|--------|-------|-----|-------|--------|
| 705231198 | João Pedro Maputo | Maputo | Administração Pública | 3º | 705231198@ucm.ac.mz | Membro |
| 704521456 | Maria Silva Beira | Beira | Engenharia Informática | 2º | 704521456@ucm.ac.mz | Membro |
| 706789123 | Carlos Nampula | Nampula | Direito | 4º | 706789123@ucm.ac.mz | Administrador |
| 705100999 | Fátima Quelimane | Quelimane | Enfermagem | 1º | 705100999@ucm.ac.mz | Membro |

## 🔒 Segurança

### Implementações:

✅ **Validação de Email**
- Aceita apenas formato: `9digitos@ucm.ac.mz`
- Rejeita padrões simples

✅ **Criptografia de Senha**
- Senhas armazenadas em hash bcrypt (não recuperável)
- Salt automático do PHP

✅ **Token JWT**
- Válido por 24 horas
- Codificado em base64
- Armazenado em localStorage

✅ **CORS**
- Headers configurados para segurança

## 🐛 Troubleshooting

### Erro: "Email deve estar no formato..."
- Cause: Email não segue padrão `9digitos@ucm.ac.mz`
- Solução: Verifique se tem exatamente 9 dígitos e domínio @ucm.ac.mz

### Erro: "Email ou senha incorretos"
- Causa: Email existe mas senha está errada
- Solução: Digite novamente a senha (certifique-se de Caps Lock)

### Erro: "Estudante não encontrado"
- Cause: Email não existe no sistema
- Solução: Contacte administração para registrar sua conta

### Erro: "Conta desativada"
- Causa: Sua conta foi desativada
- Solução: Contacte a administração

### Login não persiste após refresh
- Causa: localStorage não foi salvo
- Solução: Verifique cookies/privacy do navegador

## 📞 Suporte

Dúvidas ou problemas?
- 📧 Email: nucleo.estudantes@ucm.ac.mz
- 📱 WhatsApp: +258 84 xxx xxxx
- 🏢 Presencialmente: Secretaria do Núcleo

---

**Data:** 22 de Fevereiro de 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Produção
