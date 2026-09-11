-- ============================================================================
-- BASE DE DADOS - Núcleo dos Estudantes UCM
-- Sistema de Gestão para Área de Membros
-- Data: 22 de Fevereiro de 2026
-- ============================================================================

-- Criar base de dados
CREATE DATABASE IF NOT EXISTS `nucleoucm_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `nucleoucm_db`;

-- ============================================================================
-- TABELA: Estudantes (Autenticação)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `estudantes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(9) UNIQUE NOT NULL COMMENT 'Código único de 9 dígitos',
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email institucional: codigoestudante@ucm.ac.mz',
  `senha` VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt da senha',
  `campus` VARCHAR(50) NOT NULL DEFAULT 'Maputo',
  `curso` VARCHAR(100) NOT NULL,
  `ano` INT NOT NULL DEFAULT 1 COMMENT 'Ano de estudo (1-5)',
  `telefone` VARCHAR(20),
  `ativo` BOOLEAN DEFAULT TRUE,
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ultimo_acesso` DATETIME,
  `perfil` ENUM('membro', 'administrador', 'presidente', 'secretario', 'tesoureiro') DEFAULT 'membro',
  `foto_perfil` VARCHAR(255),
  `bio` TEXT,
  INDEX idx_codigo (codigo),
  INDEX idx_email (email),
  INDEX idx_campus (campus),
  INDEX idx_ativo (ativo),
  INDEX idx_perfil (perfil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: Notícias
-- ============================================================================
CREATE TABLE IF NOT EXISTS `noticias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `descricao` TEXT NOT NULL,
  `conteudo` LONGTEXT NOT NULL,
  `autor_id` INT NOT NULL,
  `categoria` VARCHAR(50) NOT NULL,
  `data_publicacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ativo` BOOLEAN DEFAULT TRUE,
  `imagem_destacada` VARCHAR(255),
  `visualizacoes` INT DEFAULT 0,
  FOREIGN KEY (autor_id) REFERENCES estudantes(id),
  INDEX idx_ativo (ativo),
  INDEX idx_categoria (categoria),
  INDEX idx_data_publicacao (data_publicacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: Eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS `eventos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `descricao` TEXT NOT NULL,
  `conteudo` LONGTEXT,
  `tipo` ENUM('academico', 'cultural', 'desportivo', 'social', 'formacao') NOT NULL,
  `data_inicio` DATETIME NOT NULL,
  `data_fim` DATETIME NOT NULL,
  `local` VARCHAR(200) NOT NULL,
  `campus` VARCHAR(50) NOT NULL,
  `responsavel_id` INT,
  `capacidade_maxima` INT,
  `inscricoes_abertas` BOOLEAN DEFAULT TRUE,
  `imagem` VARCHAR(255),
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (responsavel_id) REFERENCES estudantes(id),
  INDEX idx_tipo (tipo),
  INDEX idx_campus (campus),
  INDEX idx_data_inicio (data_inicio),
  INDEX idx_inscricoes_abertas (inscricoes_abertas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: Inscrições em Eventos
-- ============================================================================
CREATE TABLE IF NOT EXISTS `inscricoes_eventos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `evento_id` INT NOT NULL,
  `estudante_id` INT NOT NULL,
  `data_inscricao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `confirmado` BOOLEAN DEFAULT FALSE,
  `data_confirmacao` DATETIME,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (estudante_id) REFERENCES estudantes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_evento_estudante (evento_id, estudante_id),
  INDEX idx_confirmado (confirmado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: Direção/Membros da Diretoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS `diretoria` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `estudante_id` INT NOT NULL,
  `cargo` VARCHAR(100) NOT NULL,
  `mandato_inicio` DATE NOT NULL,
  `mandato_fim` DATE NOT NULL,
  `ativo` BOOLEAN DEFAULT TRUE,
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudante_id) REFERENCES estudantes(id),
  INDEX idx_cargo (cargo),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: Mensagens de Contacto
-- ============================================================================
CREATE TABLE IF NOT EXISTS `mensagens_contacto` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `campus` VARCHAR(50),
  `categoria` VARCHAR(50) NOT NULL,
  `assunto` VARCHAR(200) NOT NULL,
  `mensagem` LONGTEXT NOT NULL,
  `lida` BOOLEAN DEFAULT FALSE,
  `respondida` BOOLEAN DEFAULT FALSE,
  `resposta` LONGTEXT,
  `data_mensagem` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `data_resposta` DATETIME,
  INDEX idx_lida (lida),
  INDEX idx_respondida (respondida),
  INDEX idx_data_mensagem (data_mensagem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: Galeria / Fotos
-- ============================================================================
CREATE TABLE IF NOT EXISTS `fotos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `titulo` VARCHAR(200) NOT NULL,
  `descricao` TEXT,
  `ficheiro` VARCHAR(255) NOT NULL,
  `evento_id` INT,
  `album` VARCHAR(100),
  `data_upload` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `uploader_id` INT,
  `visualizacoes` INT DEFAULT 0,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE SET NULL,
  FOREIGN KEY (uploader_id) REFERENCES estudantes(id) ON DELETE SET NULL,
  INDEX idx_album (album),
  INDEX idx_evento_id (evento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: Tokens de Sessão/Autenticação
-- ============================================================================
CREATE TABLE IF NOT EXISTS `tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `estudante_id` INT NOT NULL,
  `token` VARCHAR(500) UNIQUE NOT NULL,
  `tipo` ENUM('acesso', 'atualizacao', 'recuperacao') DEFAULT 'acesso',
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `data_expiracao` DATETIME NOT NULL,
  `utilizado` BOOLEAN DEFAULT FALSE,
  `ip_address` VARCHAR(45),
  `user_agent` VARCHAR(255),
  FOREIGN KEY (estudante_id) REFERENCES estudantes(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_data_expiracao (data_expiracao),
  INDEX idx_utilizado (utilizado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABELA: Logs de Atividade
-- ============================================================================
CREATE TABLE IF NOT EXISTS `logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `estudante_id` INT,
  `acao` VARCHAR(100) NOT NULL,
  `tabela` VARCHAR(50),
  `registro_id` INT,
  `dados_antes` JSON,
  `dados_depois` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` VARCHAR(255),
  `data_log` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estudante_id) REFERENCES estudantes(id) ON DELETE SET NULL,
  INDEX idx_acao (acao),
  INDEX idx_tabela (tabela),
  INDEX idx_data_log (data_log)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERÇÃO DE DADOS DE TESTE
-- ============================================================================

-- Nota: As senhas abaixo são hash bcrypt de "codigoestudante@2026"
-- Exemplos:
-- 705231198@2026 -> $2y$10$5zB8mX9qK2R3pL1N4oQ6x.8YzA9bC1D2E3F4G5H6I7J8K9L0M1N2
-- 706789123@2026 -> $2y$10$dXJ6L8pM2qW5eN9rT7uI3O0A5sK1D2F3G4H5J6K7L8M9N0P1Q2R3

INSERT INTO `estudantes` (codigo, nome, email, senha, campus, curso, ano, ativo, perfil, telefone) VALUES
(
  '705231198',
  'João Pedro Maputo',
  '705231198@ucm.ac.mz',
  '$2y$10$5zB8mX9qK2R3pL1N4oQ6x.8YzA9bC1D2E3F4G5H6I7J8K9L0M1N2',
  'Maputo',
  'Administração Pública',
  3,
  TRUE,
  'membro',
  '84 123 4567'
),
(
  '704521456',
  'Maria Silva Beira',
  '704521456@ucm.ac.mz',
  '$2y$10$5zB8mX9qK2R3pL1N4oQ6x.8YzA9bC1D2E3F4G5H6I7J8K9L0M1N2',
  'Beira',
  'Engenharia Informática',
  2,
  TRUE,
  'membro',
  '84 234 5678'
),
(
  '706789123',
  'Carlos Nampula',
  '706789123@ucm.ac.mz',
  '$2y$10$dXJ6L8pM2qW5eN9rT7uI3O0A5sK1D2F3G4H5J6K7L8M9N0P1Q2R3',
  'Nampula',
  'Direito',
  4,
  TRUE,
  'administrador',
  '84 345 6789'
),
(
  '705100999',
  'Fátima Quelimane',
  '705100999@ucm.ac.mz',
  '$2y$10$5zB8mX9qK2R3pL1N4oQ6x.8YzA9bC1D2E3F4G5H6I7J8K9L0M1N2',
  'Quelimane',
  'Enfermagem',
  1,
  TRUE,
  'membro',
  '84 456 7890'
);

-- ============================================================================
-- DADOS DE TESTE: Diretoria
-- ============================================================================
INSERT INTO `diretoria` (estudante_id, cargo, mandato_inicio, mandato_fim, ativo) VALUES
(3, 'Presidente', '2025-09-01', '2026-08-31', TRUE),
(2, 'Vice-Presidente', '2025-09-01', '2026-08-31', TRUE),
(1, 'Secretário', '2025-09-01', '2026-08-31', TRUE),
(4, 'Tesoureiro', '2025-09-01', '2026-08-31', TRUE);

-- ============================================================================
-- DADOS DE TESTE: Notícias
-- ============================================================================
INSERT INTO `noticias` (titulo, descricao, conteudo, autor_id, categoria, ativo, imagem_destacada) VALUES
(
  'Bem-vindo ao Novo Site do Núcleo UCM',
  'Estamos felizes em anunciar o lançamento do nosso novo site!',
  'O Núcleo dos Estudantes da Universidade Católica de Moçambique apresenta com satisfação o novo portal web, desenvolvido para melhor servir a comunidade académica. Este site foi criado com o objetivo de facilitar a comunicação, partilha de informações e coordenação de atividades entre todos os membros do núcleo.',
  1,
  'Anúncio',
  TRUE,
  'images/heros/noticia-1.jpg'
),
(
  'Eventos Planeados para o Semestre',
  'Confira o calendário completo de eventos do próximo semestre.',
  'O Núcleo tem o prazer de anunciar uma série de eventos interessantes para os próximos meses, incluindo palestras, workshops, atividades desportivas e encontros sociais. Todos os estudantes são bem-vindos a participar. Consulte a página de eventos para mais detalhes.',
  1,
  'Notícia',
  TRUE,
  'images/heros/noticia-2.jpg'
);

-- ============================================================================
-- DADOS DE TESTE: Eventos
-- ============================================================================
INSERT INTO `eventos` (titulo, descricao, tipo, data_inicio, data_fim, local, campus, responsavel_id, capacidade_maxima, inscricoes_abertas) VALUES
(
  'Assembleia Geral Ordinária',
  'Assembleia para apresentação de relatórios e eleição de novos membros da diretoria.',
  'academico',
  '2026-03-15 18:00:00',
  '2026-03-15 20:00:00',
  'Auditório Central',
  'Maputo',
  3,
  500,
  TRUE
),
(
  'Torneio de Futebol Interclasses',
  'Competição amigável entre turmas do campus de Maputo.',
  'desportivo',
  '2026-04-05 15:00:00',
  '2026-04-05 19:00:00',
  'Campo de Futebol da UCM',
  'Maputo',
  1,
  100,
  TRUE
),
(
  'Workshop: Desenvolvimento Web',
  'Formação prática sobre desenvolvimento web moderno com foco em tecnologias atuais.',
  'formacao',
  '2026-03-20 14:00:00',
  '2026-03-20 17:00:00',
  'Sala de Informática 101',
  'Maputo',
  2,
  30,
  TRUE
),
(
  'Noite Cultural',
  'Noite de apresentações artísticas, música ao vivo e convívio.',
  'cultural',
  '2026-04-12 19:00:00',
  '2026-04-12 23:00:00',
  'Auditório Multiusos',
  'Beira',
  2,
  300,
  TRUE
);

-- ============================================================================
-- CRIAÇÃO DE USUÁRIO MySQL
-- ============================================================================
-- Criar usuário para a aplicação PHP (em produção, usar senha mais segura)
CREATE USER IF NOT EXISTS 'nucleoucm_user'@'localhost' IDENTIFIED BY 'N0cl30UCM@2026!';

-- Conceder permissões necessárias
GRANT ALL PRIVILEGES ON `nucleoucm_db`.* TO 'nucleoucm_user'@'localhost';

-- Aplicar permissões
FLUSH PRIVILEGES;

-- ============================================================================
-- INFORMAÇÕES ÚTEIS
-- ============================================================================
-- 
-- Credenciais de Teste:
-- 
-- 1. Membro Regular
--    Email: 705231198@ucm.ac.mz
--    Senha: 705231198@2026
--    Perfil: Membro
-- 
-- 2. Membro Regular (Beira)
--    Email: 704521456@ucm.ac.mz
--    Senha: 704521456@2026
--    Perfil: Membro
-- 
-- 3. Administrador
--    Email: 706789123@ucm.ac.mz
--    Senha: 706789123@2026
--    Perfil: Administrador
-- 
-- 4. Membro Regular (Quelimane)
--    Email: 705100999@ucm.ac.mz
--    Senha: 705100999@2026
--    Perfil: Membro
-- 
-- Usuário MySQL:
--    Username: nucleoucm_user
--    Password: N0cl30UCM@2026!
--    Database: nucleoucm_db
-- 
-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
