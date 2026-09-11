# 📊 Instalação do Banco de Dados MySQL - XAMPP

## 🚀 Passos para Configurar o Banco de Dados

### 1️⃣ INICIAR XAMPP

```
1. Abra XAMPP Control Panel
2. Clique em "Start" para Apache ✅
3. Clique em "Start" para MySQL ✅
```

### 2️⃣ ACESSAR PHPMYADMIN

Abra seu navegador e vá para:
```
http://localhost/phpmyadmin
```

### 3️⃣ IMPORTAR O ARQUIVO SQL

**Método 1: Via Interface**
```
1. Clique na aba "Importar"
2. Clique em "Selecionar arquivo"
3. Escolha: database/nucleoucm.sql
4. Clique em "Executar"
```

**Método 2: Via Linha de Comando (PowerShell)**
```powershell
cd "C:\xampp\mysql\bin"
.\mysql -u root < "C:\Site\nucleo-estudantes\nucleo-estudantes\database\nucleoucm.sql"
```

**Método 3: Via Linha de Comando (CMD)**
```cmd
cd C:\xampp\mysql\bin
mysql -u root < "C:\Site\nucleo-estudantes\nucleo-estudantes\database\nucleoucm.sql"
```

### 4️⃣ VERIFICAR A INSTALAÇÃO

Após executar o SQL, você deve ver:

✅ Base de dados criada: `nucleoucm_db`  
✅ Usuário criado: `nucleoucm_user`  
✅ 4 estudantes de teste inseridos  
✅ Estrutura completa de tabelas  

### 5️⃣ CONFIRMAR DADOS

No phpMyAdmin:
1. Expanda `nucleoucm_db`
2. Selecione tabela `estudantes`
3. Clique em "Ver" para confirmar 4 registros

## 📋 Credenciais Criadas

### Usuário MySQL
```
Username: nucleoucm_user
Password: N0cl30UCM@2026!
Database: nucleoucm_db
Host: localhost
```

### Estudantes de Teste
```
1. 705231198@ucm.ac.mz  (Senha: 705231198@2026)
2. 704521456@ucm.ac.mz  (Senha: 704521456@2026)
3. 706789123@ucm.ac.mz  (Senha: 706789123@2026) [Admin]
4. 705100999@ucm.ac.mz  (Senha: 705100999@2026)
```

## 🔧 Atualizar Arquivo de Configuração

O arquivo `/api/config/database.php` já foi atualizado automaticamente com:
- Host: `localhost`
- Database: `nucleoucm_db`
- User: `nucleoucm_user`
- Password: `N0cl30UCM@2026!`

## 📁 Estrutura de Tabelas Criadas

### Tabelas Principais:
- ✅ `estudantes` - Dados dos estudantes e autenticação
- ✅ `noticias` - Publicações de notícias
- ✅ `eventos` - Eventos organizados
- ✅ `inscricoes_eventos` - Inscrições em eventos
- ✅ `diretoria` - Membros da direção
- ✅ `mensagens_contacto` - Mensagens recebidas
- ✅ `fotos` - Galeria de fotos
- ✅ `tokens` - Tokens de autenticação
- ✅ `logs` - Registro de atividades

## 🧪 Testar a Conexão

Crie um arquivo `test_db.php` em `/`:

```php
<?php
try {
    $config = include __DIR__ . '/api/config/database.php';
    
    $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
    
    $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
    
    echo "<h1 style='color:green'>✓ Conexão Bem-Sucedida!</h1>";
    echo "<p>Base de dados: {$config['database']}</p>";
    echo "<p>Host: {$config['host']}</p>";
    
    // Testar query
    $result = $pdo->query("SELECT COUNT(*) as total FROM estudantes");
    $data = $result->fetch();
    echo "<p>Total de estudantes: {$data['total']}</p>";
    
} catch (Exception $e) {
    echo "<h1 style='color:red'>✗ Erro na Conexão</h1>";
    echo "<p>{$e->getMessage()}</p>";
}
?>
```

Acesse: `http://localhost/nucleo-estudantes/test_db.php`

## ⚠️ Problemas Comuns

### "Access denied for user 'root'@'localhost'"
- MySQL não está rodando
- Solução: Inicie MySQL no XAMPP Control Panel

### "Base de dados 'nucleoucm_db' não existe"
- O SQL não foi executado corretamente
- Solução: Repita os passos de importação

### "Connection refused"
- MySQL não está na porta 3306
- Solução: Verifique configurações de porta no XAMPP

### "1064 You have an error in your SQL syntax"
- Arquivo SQL corrompido
- Solução: Use um editor de texto para verificar encoding (UTF-8)

## 🔄 Resetar/Recriar Base de Dados

Para remover e recriar do zero:

```sql
DROP DATABASE IF EXISTS nucleoucm_db;
DROP USER IF EXISTS 'nucleoucm_user'@'localhost';
```

Depois execute o arquivo SQL novamente.

## 📋 Backup da Base de Dados

### Fazer Backup:
```powershell
mysqldump -u nucleoucm_user -p -h localhost nucleoucm_db > "C:\backups\nucleoucm_backup.sql"
```

### Restaurar Backup:
```powershell
mysql -u nucleoucm_user -p -h localhost nucleoucm_db < "C:\backups\nucleoucm_backup.sql"
```

## 🚀 Próximos Passos

Após confirmar que o banco funcionando:

1. ✅ Verificar `/api/config/database.php`
2. ✅ Testar login em `/login.html`
3. ✅ Usar credenciais de teste
4. ✅ Confirmar redirecionamento para área-membros

---

**Última atualização:** 22 de Fevereiro de 2026  
**Versão:** 1.0 - Production Ready
