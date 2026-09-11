oi# 🔧 Guia de Resolução - Erro de Conexão

## ⚠️ Problema: "Erro de conexão. Verifique sua internet e tente novamente"

Isto significa que o JavaScript não consegue fazer a requisição para o arquivo `api/index.php`.

---

## 🎯 Passos para Resolver

### 1️⃣ Primeiro: Verificar o Diagnóstico

**Abra no navegador:**
```
http://localhost/nucleo-estudantes/diagnostico.html
```

Este arquivo vai verificar automaticamente:
- ✓ Se os arquivos existem
- ✓ Se a API está respondendo
- ✓ Se há problemas de configuração

### 2️⃣ Verificar o Console do Navegador

Abra o console (pressione **F12** ou **Ctrl+Shift+K**):

1. Na aba **Console**
2. Tente fazer login no login.html
3. Procure por mensagens como:

```
=== LOGIN REQUEST ===
Base URL: /nucleo-estudantes
API URL: /nucleo-estudantes/api/index.php
Response Status: 200 (ou erro)
```

**O que procurar:**
- ✅ **Status 200** = Sucesso (a API respondeu)
- ❌ **404** = Arquivo api/index.php não encontrado
- ❌ **500** = Erro no servidor PHP
- ❌ **TypeError** = Servidor não está respondendo

### 3️⃣ Verificar se o Servidor Web está Rodando

**Windows com XAMPP:**
```powershell
# Abra XAMPP Control Panel
# Procure por "Apache" e clique em "Start"
# Se ficar verde, está OK
```

**Windows com IIS:**
```powershell
# Abra Services (services.msc)
# Procure por "World Wide Web Publishing Service"
# Se está "Running", está OK
```

### 4️⃣ Verificar o Caminho Correto

O site está em qual pasta?

```
C:\Site\nucleo-estudantes\nucleo-estudantes\  ← AQUI
```

**URL correta no navegador:**
```
http://localhost/Site/nucleo-estudantes/nucleo-estudantes/login.html
ou
http://localhost/nucleo-estudantes/login.html  (se alias configurado)
ou
http://seu-dominio.com/login.html
```

### 5️⃣ Testar URL da API Diretamente

Abra no navegador:
```
http://localhost/nucleo-estudantes/api/index.php
```

**Resultado esperado:**
```json
{
  "success": false,
  "error": "Endpoint não encontrado"
}
```

Se receber isto, a API está funcionando! ✓

### 6️⃣ Verificar os Arquivos PHP

Confirme que estes arquivos existem:
```
api/index.php              ← Ponto de entrada
php/api.php                ← Lógica (NÃO é mais usado, pode deletar)
php/estudantes.php         ← Autenticação
database/estudantes.json   ← Banco de dados
```

---

## 🚨 Erros Comuns e Soluções

### "Cannot GET /api/index.php"
**Causa:** Arquivo não existe ou está em pasta errada
**Solução:** Verifique se o arquivo `api/index.php` existe

### "Fatal error: Failed opening required file"
**Causa:** Arquivo PHP requerido não encontrado
**Solução:** Verifique se `php/estudantes.php` existe

### "Unexpected character in JSON"
**Causa:** API retornou HTML em vez de JSON (erro 404 ou 500)
**Solução:** Verifique logs do servidor web

### Status 403 (Forbidden)
**Causa:** Permissões insuficientes
**Solução:** 
- Windows: Adicione permissões ao usuário IIS/Apache
- Linux: `chmod 755 api/` e `chmod 644 api/index.php`

---

## ✅ Verifi cação Final

Quando conseguir fazer login com sucesso, vai ver:

1. ✓ No formulário: Redirecionamento para area-membros.html
2. ✓ No console: Mensagem "=== LOGIN SUCCESS ===" com dados do usuário
3. ✓ No localStorage: Token e dados do estudante salvos

---

## 📞 Debug Avançado

**Ativar logs em api/index.php:**

Procure no arquivo por:
```php
error_log("API Request: ...");
```

Logs aparecerão em:
```
Windows XAMPP: C:\xampp\apache\logs\error.log
Windows IIS: C:\inetpub\logs\LogFiles\
Linux: /var/log/apache2/error.log
```

---

## 🔍 Checklist Final

Antes de reportar erro, verifique:

- [ ] Servidor web está rodando
- [ ] api/index.php existe em `api/` pasta
- [ ] php/estudantes.php existe
- [ ] database/estudantes.json existe
- [ ] Permissões corretas nos arquivos
- [ ] Console do navegador não mostra ERROs (F12)
- [ ] URL no navegador é a correta
- [ ] Nenhum firewall bloqueando localhost

---

**Se ainda tiver problemas:**

1. Abra `diagnostico.html` (mostrará o problema exato)
2. Copie a saída do console (F12 → Console → Ctrl+A → Ctrl+C)
3. Verifique o arquivo de log do servidor web
4. Procure por mensagens de erro específicas

