# AREA DE MEMBROS - Guia Completo

## Visão Geral

A Área de Membros é um portal completo para a gestão de atividades do Núcleo dos Estudantes UCM. Os utilizadores autenticados podem acessar vários recursos e funcionalidades.

## Autenticação

Antes de acessar a área de membros, você deve fazer login usando:

- **Email Institucional**: `codigoestudante@ucm.ac.mz`
- **Senha**: `codigoestudante@2026`

### Credenciais de Teste

```
Email: 705231198@ucm.ac.mz
Senha: 705231198@2026
```

## Funcionalidades Disponíveis

### 1. Dashboard
- **Descrição**: Visão geral do portal com estatísticas
- **Conteúdo**:
  - Contadores: Membros ativos, eventos, notícias, fotos
  - Próximos eventos
  - Últimas notícias
  - Minhas inscrições

### 2. Minha Conta

#### Perfil
- Visualizar dados pessoais
- Nome completo
- Código de estudante
- Email institucional
- Campus
- Curso
- Ano de estudo
- Botões de ação (editar perfil, alterar senha)

#### Notificações
- Gerir preferências de notificação
- Ver notificações do sistema

### 3. Eventos

#### Lista de Eventos
- Visualizar todos os eventos disponíveis
- Filtrar por:
  - Tipo de evento (académico, cultural, desportivo, social, formação)
  - Campus (Maputo, Beira, Nampula)
  - Busca por nome
- Clicar em "Mais detalhes" para ver informações completas
- Inscrever-se em eventos

#### Minhas Inscrições
- Ver todos os eventos nos quais se inscreveu
- Ver status da inscrição: confirmado, pendente, cancelado
- Datas e locais dos eventos

### 4. Conteúdo

#### Notícias
- Visualizar todas as notícias do Núcleo
- Categorias de notícias (importante, eventos, formulários, galeria)
- Data de publicação
- Número de visualizações

#### Galeria
- Visualizar fotos dos eventos
- Organizadas por álbuns
- Hover para ver descrição

### 5. Administração

#### Membros
- Visualizar lista completa de membros
- Buscar membros por nome
- Ver informações: nome, campus, email, curso

#### Configurações
- Preferências de notificação
- Configurações de segurança
- Opção de alterar senha

## Estrutura de Dados

### JSON Files

O sistema usa arquivos JSON para persistência de dados:

#### noticias.json
```json
{
  "id": 1,
  "titulo": "Título da notícia",
  "conteudo": "Conteúdo...",
  "categoria": "importante",
  "data_criacao": "2026-02-22T10:00:00",
  "visualizacoes": 145,
  "autor_id": 1
}
```

#### eventos.json
```json
{
  "id": 1,
  "nome": "Nome do evento",
  "descricao": "Descrição...",
  "tipo": "academico",
  "data_inicio": "2026-03-05T10:00:00",
  "data_fim": "2026-03-05T12:00:00",
  "local": "Sala de Conferências A",
  "campus": "Maputo",
  "responsavel_id": 1
}
```

#### membros.json
```json
{
  "id": 1,
  "codigo": "705231198",
  "nome": "João Silva",
  "email": "705231198@ucm.ac.mz",
  "campus": "Maputo",
  "curso": "Licenciatura em Informática",
  "ano_estudo": "3º",
  "ativo": true,
  "perfil": "membro"
}
```

#### fotos.json
```json
{
  "id": 1,
  "descricao": "Descrição da foto",
  "caminho_arquivo": "images/placeholders/photo1.jpg",
  "album": "Nome do álbum",
  "evento_id": 1,
  "data_upload": "2026-02-20T15:30:00"
}
```

#### inscricoes_eventos.json
```json
{
  "id": 1,
  "evento_id": 1,
  "evento_nome": "Nome do evento",
  "evento_data": "2026-03-05T10:00:00",
  "estudante_codigo": "705231198",
  "data_inscricao": "2026-02-22T10:30:00",
  "status": "confirmado"
}
```

## Classes JavaScript

### MembrosManager (js/membros.js)

Gerenciador principal do portal de membros.

#### Métodos Principais

- `init()` - Inicializa o portal
- `carregarDashboard()` - Carrega dashboard com estatísticas
- `carregarPerfil()` - Exibe perfil do utilizador
- `carregarEventos()` - Lista todos os eventos
- `carregarMinhasInscricoes()` - Mostra inscrições do utilizador
- `carregarNoticias()` - Lista notícias
- `carregarGaleria()` - Exibe galeria de fotos
- `carregarMembros()` - Lista membros
- `mostrarDetalhesEvento(id)` - Abre modal com detalhes do evento
- `inscreverEmEvento()` - Realizar inscrição em evento
- `filtrarEventos()` - Aplica filtros na lista de eventos
- `fazerLogout()` - Desconecta o utilizador

## API Endpoints

Os endpoints esperados são:

### GET
- `php/api.php?endpoint=noticias` - Lista notícias
- `php/api.php?endpoint=eventos` - Lista eventos
- `php/api.php?endpoint=eventos&id=1` - Detalhes de evento específico
- `php/api.php?endpoint=membros` - Lista membros
- `php/api.php?endpoint=fotos` - Lista fotos
- `php/api.php?endpoint=inscricoes_eventos&estudante=CODIGO` - Inscrições do utilizador

### POST
- `php/api.php` - para inscrições e outras ações

## Estilo Visual

### Cores Primárias
- Cor Primária: `#667eea` (Roxo)
- Cor Secundária: `#764ba2` (Roxo Escuro)
- Cor de Sucesso: `#28a745` (Verde)
- Cor de Aviso: `#ffc107` (Amarelo)
- Cor de Erro: `#dc3545` (Vermelho)

### Layout
- Sidebar fixa à esquerda (280px)
- Conteúdo principal responsivo
- Animações suaves
- Design mobile-friendly

## Como Adicionar Novos Dados

### 1. Adicionar Notícia
Edite `database/noticias.json` e adicione um novo objeto:
```json
{
  "id": 5,
  "titulo": "Nova notícia",
  "conteudo": "Conteúdo...",
  "categoria": "importante",
  "data_criacao": "2026-02-23T10:00:00",
  "visualizacoes": 0,
  "autor_id": 1
}
```

### 2. Adicionar Evento
Edite `database/eventos.json`:
```json
{
  "id": 7,
  "nome": "Novo evento",
  "descricao": "Descrição...",
  "tipo": "academico",
  "data_inicio": "2026-03-25T10:00:00",
  "data_fim": "2026-03-25T12:00:00",
  "local": "Local...",
  "campus": "Maputo",
  "responsavel_id": 1
}
```

### 3. Adicionar Membro
Edite `database/membros.json`:
```json
{
  "id": 7,
  "codigo": "716789012",
  "nome": "Novo Membro",
  "email": "716789012@ucm.ac.mz",
  "campus": "Maputo",
  "curso": "Licenciatura em...",
  "ano_estudo": "1º",
  "ativo": true,
  "perfil": "membro"
}
```

## Troubleshooting

### Problema: Dados não aparecem no portal
- Verifique se os arquivos JSON estão em `database/`
- Verifique a sintaxe JSON dos arquivos
- Abra o console (F12) para ver erros específicos

### Problema: Login não funciona
- Verifique se `php/estudantes.php` existe
- Verifique se `js/auth.js` está carregando corretamente
- Verifique o formato do email: `codigoestudante@ucm.ac.mz`

### Problema: Modal de evento não abre
- Verifique se o JavaScript está carregando
- Verifique o console para erros

## Próximas Melhorias

- [ ] Integração com MySQL
- [ ] Autenticação JWT com tokens
- [ ] Edição de perfil
- [ ] Sistema de comentários
- [ ] Notificações em tempo real
- [ ] Exportar relatórios
- [ ] Upload de fotos
- [ ] Sistema de permissões granulares

## Suporte

Para questões sobre o uso do portal, contacte:
- Email: nucleo@ucm.ac.mz
- Local: Centro de Estudantes, Campus Maputo
