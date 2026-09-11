# 📊 GUIA COMPLETO: INSTALAÇÃO DO BANCO DE DADOS NO XAMPP

## 🚀 Visão Geral

Este guia passo-a-passo mostra como instalar a base de dados MySQL do Núcleo dos Estudantes UCM no XAMPP (Windows).

---

## 📋 Pré-requisitos

✅ XAMPP instalado em `C:\xampp`  
✅ Apache iniciado  
✅ MySQL iniciado (XAMPP Control Panel)  
✅ Navegador web

---

## 🔧 OPÇÃO 1: Instalação Automática (Recomendada)

### Passo 1: Executar Instalador

```
1. Abra XAMPP Control Panel
2. Certifique-se de que MySQL está "Running" (verde)
3. Feche todos os abas do navegador phpMyAdmin se houver
4. Clique duas vezes em: database/instalar.bat
5. Digite "S" quando perguntado
6. Aguarde a conclusão
```

### Passo 2: Gerar Hashes das Senhas

```
1. Abra navegador
2. Acesse: http://localhost/nucleo-estudantes/gerar_hashes.php
3. Clique em "Gerar Hashes Bcrypt"
4. Copie todo o código SQL gerado
```

### Passo 3: Inserir Dados de Teste

```
1. Abra phpMyAdmin: http://localhost/phpmyadmin
2. Na esquerda, selecione 'nucleoucm_db'
3. Clique na aba "SQL"
4. Cole o código copiado do passo anterior
5. Clique em "Executar" / "Go"
6. Confirme que foi inserido (4 registros)
```

---

## 🔧 OPÇÃO 2: Instalação Manual (phpMyAdmin)

### Passo 1: Criar Base de Dados e Usuário

```
1. Abra phpMyAdmin: http://localhost/phpmyadmin
2. Clique em "Novo"
3. Digite: nucleoucm_db
4. Charset: utf8mb4 - utf8mb4_unicode_ci
5. Clique em "Criar"
```

### Passo 2: Importar Estrutura

```
1. Selecione database 'nucleoucm_db'
2. Clique em "Importar"
3. Clique em "Selecionar arquivo"
4. Escolha: database/nucleoucm_base.sql
5. Clique em "Executar"
```

### Passo 3: Gerar e Importar Dados

```
1. Acesse: http://localhost/nucleo-estudantes/gerar_hashes.php
2. Clique "Gerar Hashes Bcrypt"
3. Copie o código SQL gerado
4. Volta ao phpMyAdmin
5. Aba "SQL" → Cole o código → "Executar"
```

---

## 🔧 OPÇÃO 3: Instalação via Linha de Comando

### PowerShell:

```powershell
# 1. Navegar para XAMPP MySQL
cd "C:\xampp\mysql\bin"

# 2. Executar arquivo SQL base
.\mysql -u root < "C:\Site\nucleo-estudantes\nucleo-estudantes\database\nucleoucm_base.sql"

# 3. Confirmar que funcionou
.\mysql -u root nucleoucm_db -e "SELECT * FROM estudantes;"
```

### Comando Prompt (CMD):

```cmd
cd C:\xampp\mysql\bin
mysql -u root < "C:\Site\nucleo-estudantes\nucleo-estudantes\database\nucleoucm_base.sql"
```

---

## ✅ Verificar Instalação

### Via phpMyAdmin:

```
1. Acesse: http://localhost/phpmyadmin
2. Lado esquerdo, expanda 'nucleoucm_db'
3. Verifique se existem tabelas como:
   ✓ estudantes
   ✓ noticias
   ✓ eventos
   ✓ diretoria
   ✓ etc.
```

### Via PHP (Teste de Conexão):

```
1. Abra navegador
2. Acesse: http://localhost/nucleo-estudantes/test_db.php
3. Deve mostrar "✓ Conexão Bem-Sucedida!"
```

---

## 📧 Dados de Teste

### Credenciais:

| Email | Senha | Nome | Campus | Perfil |
|-------|-------|------|--------|--------|
| 705231198@ucm.ac.mz | 705231198@2026 | João Pedro | Maputo | Membro |
| 704521456@ucm.ac.mz | 704521456@2026 | Maria Silva | Beira | Membro |
| 706789123@ucm.ac.mz | 706789123@2026 | Carlos | Nampula | Admin |
| 705100999@ucm.ac.mz | 705100999@2026 | Fátima | Quelimane | Membro |

### Usuário MySQL:

```
Username: nucleoucm_user
Password: N0cl30UCM@2026!
Database: nucleoucm_db
Host: localhost:3306
```

---

## 🧪 Teste o Login

```
1. Acesse: http://localhost/nucleo-estudantes/login.html
2. Digite:
   Email: 705231198@ucm.ac.mz
   Senha: 705231198@2026
3. Clique em "Entrar"
4. Deve redirecionar para area-membros.html
```

---

## 🔒 Configuração de Arquivo

O arquivo `/api/config/database.php` já vem configurado com:

```php
'host' => 'localhost',
'database' => 'nucleoucm_db',
'username' => 'nucleoucm_user',
'password' => 'N0cl30UCM@2026!',
```

Se precisar mudar, edite:
```
c:\Site\nucleo-estudantes\nucleo-estudantes\api\config\database.php
```

---

## 🐛 Troubleshooting

### ❌ "Connection refused"
**Solução:** Inicie MySQL no XAMPP Control Panel

### ❌ "Access denied for user 'root'"
**Solução:** MySQL não está rodando. Clique "Start" em XAMPP Control Panel

### ❌ "Database nucleoucm_db not found"
**Solução:** Importar o SQL novamente
```
1. Abra phpMyAdmin
2. Clique "Importar"
3. Escolha database/nucleoucm_base.sql
```

### ❌ "Error: table 'estudantes' doesn't exist"
**Solução:** A estrutura não foi criada. Repita Passo 2

### ❌ Login mostra erro "Estudante não encontrado"
**Solução:** Os dados não foram inseridos. Revise Passo 3 (gerar hashes)

### ❌ Arquivo instalar.bat deu erro
**Solução:** 
```
1. Abra Prompt de Comando como Administrador
2. cd C:\Site\nucleo-estudantes\nucleo-estudantes\database
3. instalar.bat
```

---

## 🔄 Resetar / Recriar Base de Dados

### Via phpMyAdmin:
```
1. Selecione 'nucleoucm_db'
2. Clique em "Desistir" (na aba direita)
3. Confirme "Sim"
4. Repita a instalação
```

### Via Linha de Comando:
```mysql
DROP DATABASE IF EXISTS nucleoucm_db;
DROP USER IF EXISTS 'nucleoucm_user'@'localhost';
```

Depois repita a instalação.

---

## 📝 Estrutura do Banco

### Tabelas Principais:

1. **estudantes** - Dados de login e perfil
2. **noticias** - Publicações do núcleo
3. **eventos** - Eventos e atividades
4. **inscricoes_eventos** - Inscrições de estudantes
5. **diretoria** - Membros da direção
6. **mensagens_contacto** - Formulário de contacto
7. **fotos** - Galeria de imagens
8. **tokens** - Sessões de autenticação
9. **logs** - Histórico de atividades

---

## 🔒 Segurança

✅ **Senhas:** Hash bcrypt (não recuperável)  
✅ **Usuário MySQL:** Permissões limitadas ao banco  
✅ **Tokens:** JWT com expiração 24h  
✅ **Conexão:** PDO com prepared statements  

---

## 📞 Próximas Etapas

Após confirmar:

- [ ] Base de dados criada ✓
- [ ] Dados de teste inseridos ✓
- [ ] Login teste funciona ✓
- [ ] Dados aparecem em phpMyAdmin ✓

Próximos:
1. Deploy para servidor web
2. Configurar email para recuperação de senha
3. Backups automáticos
4. Integração com LDAP da UCM (opcional)

---

## 📞 Suporte

Dúvidas?

- 📧 Email: suporte@nucleoucm.ac.mz
- 📱 WhatsApp: +258 84 123 4567
- 💬 Chat: Discord (link em breve)

---

**Última atualização:** 22 de Fevereiro de 2026  
**Versão:** 1.0 - XAMPP Ready  
**Status:** ✅ Production Ready
