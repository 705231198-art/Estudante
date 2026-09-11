-- Script de criação do banco de dados
CREATE DATABASE IF NOT EXISTS nucleoucm_api;
USE nucleoucm_api;

-- Tabela de notícias
CREATE TABLE noticias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    conteudo LONGTEXT NOT NULL,
    resumo VARCHAR(500),
    imagem VARCHAR(255),
    autor VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tags JSON,
    campus VARCHAR(50) DEFAULT 'todos',
    visualizacoes INT DEFAULT 0,
    status ENUM('rascunho', 'publicada', 'arquivada') DEFAULT 'rascunho',
    destaque BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    publicado_em TIMESTAMP NULL,
    INDEX idx_categoria (categoria),
    INDEX idx_status (status),
    INDEX idx_campus (campus),
    INDEX idx_destaque (destaque),
    FULLTEXT idx_search (titulo, conteudo, resumo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de eventos
CREATE TABLE eventos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    descricao VARCHAR(500),
    conteudo LONGTEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    local VARCHAR(200),
    endereco VARCHAR(500),
    categoria VARCHAR(50),
    campus VARCHAR(50) DEFAULT 'todos',
    organizador VARCHAR(100),
    inscricoes_abertas BOOLEAN DEFAULT TRUE,
    vagas INT DEFAULT 0,
    inscritos INT DEFAULT 0,
    imagem VARCHAR(255),
    status ENUM('ativo', 'cancelado', 'realizado') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data_inicio (data_inicio),
    INDEX idx_categoria (categoria),
    INDEX idx_campus (campus),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de membros
CREATE TABLE membros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    campus VARCHAR(50) NOT NULL,
    departamento VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20),
    foto VARCHAR(255),
    bio TEXT,
    ordem INT DEFAULT 0,
    status ENUM('ativo', 'inativo', 'egresso') DEFAULT 'ativo',
    redes_sociais JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_cargo (cargo),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de mensagens de contato
CREATE TABLE mensagens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    assunto VARCHAR(200),
    mensagem TEXT NOT NULL,
    campus VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    respondida BOOLEAN DEFAULT FALSE,
    lida BOOLEAN DEFAULT FALSE,
    resposta TEXT,
    respondedor_id INT,
    respondedor_nome VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    responded_em TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_respondida (respondida),
    INDEX idx_lida (lida),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de usuários (administração)
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
    campus VARCHAR(50) DEFAULT 'todos',
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_campus (campus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de logs da API
CREATE TABLE api_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    endpoint VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INT,
    INDEX idx_endpoint (endpoint),
    INDEX idx_method (method),
    INDEX idx_user_id (user_id),
    INDEX idx_request_time (request_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO usuarios (username, email, senha_hash, nome, role) VALUES
('admin', 'admin@nucleoucm.ac.mz', '$2y$10$YourHashedPasswordHere', 'Administrador', 'admin');