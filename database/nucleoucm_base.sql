-- ============================================================================
-- BASE DE DADOS - Núcleo dos Estudantes UCM
-- Sistema de Gestão para Área de Membros
-- Data: 22 de Fevereiro de 2026
-- ============================================================================

-- ⚠️ IMPORTANTE: 
-- Os hashes das senhas são gerados via PHP (password_hash com bcrypt)
-- Use o arquivo: gerar_hashes.php para gerar os hashes corretos
-- Copie os hashes gerados e substitua os valores abaixo

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
-- CRIAÇÃO DE USUÁRIO MySQL
-- ============================================================================
CREATE USER IF NOT EXISTS 'nucleoucm_user'@'localhost' IDENTIFIED BY 'N0cl30UCM@2026!';
GRANT ALL PRIVILEGES ON `nucleoucm_db`.* TO 'nucleoucm_user'@'localhost';
FLUSH PRIVILEGES;

-- ============================================================================
-- PASSO 1: Acesse http://localhost/nucleo-estudantes/gerar_hashes.php
-- PASSO 2: Clique em "Gerar Hashes Bcrypt"
-- PASSO 3: Copie o SQL gerado
-- PASSO 4: Cole aqui abaixo (substitua os INSERTs de exemplo)
-- ============================================================================

-- INSIRA OS DADOS AQUI (veja instrução acima)
-- Exemplodeixa seguir instruções de como fazer:

DELIMITER $$

CREATE TRIGGER `estudantes_before_insert`
BEFORE INSERT ON `estudantes`
FOR EACH ROW
BEGIN
    SET NEW.data_criacao = CURRENT_TIMESTAMP;
    SET NEW.data_atualizacao = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER `estudantes_before_update`
BEFORE UPDATE ON `estudantes`
FOR EACH ROW
BEGIN
    SET NEW.data_atualizacao = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- ============================================================================
-- ============================================================================
-- INSTRUÇÕES FINAIS
-- ============================================================================

-- 1. Execute este SQL para criar a estrutura base
-- 2. Abra: http://localhost/nucleo-estudantes/gerar_hashes.php
-- 3. Clique "Gerar Hashes Bcrypt"
-- 4. Copie o SQL INSERT gerado
-- 5. Cole num novo arquivo ou execute aqui no phpMyAdmin
-- 
-- Credenciais MySQL Criadas:
--   Username: nucleoucm_user
--   Password: N0cl30UCM@2026!
--   Database: nucleoucm_db
--
-- ============================================================================
