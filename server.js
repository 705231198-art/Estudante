import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper to safely load JSON database files
const dbDir = path.join(__dirname, 'database');

function loadJSON(filename, defaultValue) {
  try {
    const filePath = path.join(dbDir, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`Could not load ${filename}:`, err.message);
  }
  return defaultValue;
}

function saveJSON(filename, data) {
  try {
    const filePath = path.join(dbDir, filename);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Could not save ${filename}:`, err.message);
  }
}

// Initialize in-memory databases with disk persistence
let estudantesDb = loadJSON('estudantes.json', {
  "705231198": {
    "codigo": "705231198",
    "nome": "Papaito Jaime Amur",
    "email": "705231198@ucm.ac.mz",
    "campus": "Maputo",
    "curso": "Engenharia Informática",
    "ano": 3,
    "ativo": true,
    "perfil": "administrador"
  },
  "704521456": {
    "codigo": "704521456",
    "nome": "Maria Santos",
    "email": "704521456@ucm.ac.mz",
    "campus": "Beira",
    "curso": "Licenciatura em Engenharia Civil",
    "ano": 2,
    "ativo": true,
    "perfil": "membro"
  },
  "706789123": {
    "codigo": "706789123",
    "nome": "Pedro Mendes",
    "email": "706789123@ucm.ac.mz",
    "campus": "Nampula",
    "curso": "Licenciatura em Administração",
    "ano": 4,
    "ativo": true,
    "perfil": "administrador"
  },
  "708234567": {
    "codigo": "708234567",
    "nome": "Ana Costa",
    "email": "708234567@ucm.ac.mz",
    "campus": "Maputo",
    "curso": "Licenciatura em Contabilidade",
    "ano": 1,
    "ativo": true,
    "perfil": "membro"
  }
});

// Ensure 705231198 has both "administrador" permissions and president name
if (estudantesDb["705231198"]) {
  estudantesDb["705231198"].nome = "Papaito Jaime Amur";
  estudantesDb["705231198"].perfil = "administrador";
}

let noticiasDb = loadJSON('noticias.json', [
  {
    id: 1,
    titulo: "Bem-vindo ao Portal de Membros",
    conteudo: "Bem-vindo ao novo portal de membros do Núcleo dos Estudantes UCM. Aqui você pode ver todos os eventos, notícias e gerir sua participação nas atividades.",
    categoria: "importante",
    data_criacao: "2026-02-22T10:00:00",
    visualizacoes: 145,
    autor_id: 1
  },
  {
    id: 2,
    titulo: "Seminário de Tecnologia 2026",
    conteudo: "O Núcleo convida todos os estudantes para o seminário de tecnologia que acontecerá no próximo mês.",
    categoria: "eventos",
    data_criacao: "2026-02-20T14:30:00",
    visualizacoes: 89,
    autor_id: 1
  }
]);

let eventosDb = loadJSON('eventos.json', [
  {
    id: 1,
    nome: "Seminário de Desenvolvimento Web",
    descricao: "Aprenda as melhores práticas em desenvolvimento web moderno com HTML5, CSS3 e JavaScript. Instrutor: João Silva",
    tipo: "academico",
    data_inicio: "2026-03-05T10:00:00",
    data_fim: "2026-03-05T12:00:00",
    local: "Sala de Conferências A",
    campus: "Maputo",
    responsavel_id: 1
  },
  {
    id: 2,
    nome: "Encontro Cultural e Musical",
    descricao: "Venha aproveitar uma noite de música ao vivo, dança, comida tradicional e oportunidade de conhecer novos membros da comunidade!",
    tipo: "cultural",
    data_inicio: "2026-03-10T18:00:00",
    data_fim: "2026-03-10T23:00:00",
    local: "Auditório Principal",
    campus: "Maputo",
    responsavel_id: 2
  }
]);

let membrosDb = loadJSON('membros.json', [
  {
    id: 1,
    codigo: "705231198",
    nome: "Papaito Jaime Amur",
    email: "705231198@ucm.ac.mz",
    campus: "Maputo",
    curso: "Engenharia Informática",
    ano_estudo: "3º",
    ativo: true,
    perfil: "administrador",
    data_inscricao: "2025-01-15"
  }
]);

let fotosDb = loadJSON('fotos.json', [
  {
    id: 1,
    descricao: "Momento do seminário de tecnologia",
    caminho_arquivo: "images/placeholders/galeria1.jpg",
    album: "Seminário Tecnologia 2026",
    evento_id: 1,
    data_upload: "2026-02-20T15:30:00"
  },
  {
    id: 2,
    descricao: "Apresentação sobre web design",
    caminho_arquivo: "images/placeholders/galeria2.jpg",
    album: "Seminário Tecnologia 2026",
    evento_id: 1,
    data_upload: "2026-02-20T15:45:00"
  }
]);

let inscricoesDb = loadJSON('inscricoes_eventos.json', [
  {
    id: 1,
    evento_id: 1,
    evento_nome: "Seminário de Desenvolvimento Web",
    evento_data: "2026-03-05T10:00:00",
    evento_local: "Sala de Conferências A",
    evento_descricao: "Aprenda as melhores práticas em desenvolvimento web moderno",
    estudante_codigo: "705231198",
    data_inscricao: "2026-02-22T10:30:00",
    status: "confirmado"
  }
]);

let mensagensDb = loadJSON('mensagens.json', []);

// Health check endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Helper function for Auth Login
function handleLogin(req, res) {
  const email = (req.body.email || req.body.usuario || '').trim().toLowerCase();
  const senha = req.body.password || req.body.senha || '';

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email é obrigatório' });
  }

  // Find student in database
  let estudante = null;
  const list = Object.values(estudantesDb);
  estudante = list.find(s => s.email && s.email.toLowerCase() === email);

  // If not found by email, try by student code
  if (!estudante) {
    const codeMatch = email.match(/^(\d+)/);
    if (codeMatch && estudantesDb[codeMatch[1]]) {
      estudante = estudantesDb[codeMatch[1]];
    }
  }

  // If not found but is institutional email, auto-register as valid member
  if (!estudante && email.endsWith('@ucm.ac.mz')) {
    const codeMatch = email.match(/^(\d{9})/);
    const code = codeMatch ? codeMatch[1] : Date.now().toString().slice(-9);
    estudante = {
      codigo: code,
      nome: `Estudante ${code}`,
      email: email,
      campus: "Maputo",
      curso: "Informática",
      ano: 1,
      ativo: true,
      perfil: "membro"
    };
    estudantesDb[code] = estudante;
    saveJSON('estudantes.json', estudantesDb);
  }

  if (!estudante) {
    return res.status(401).json({
      success: false,
      error: 'Estudante não encontrado. Use o formato: CODIGO@ucm.ac.mz'
    });
  }

  // Generate session token
  const tokenPayload = {
    sub: estudante.codigo,
    email: estudante.email,
    perfil: estudante.perfil,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  return res.json({
    success: true,
    token,
    estudante,
    mensagem: 'Login bem-sucedido'
  });
}

// Authentication endpoints
app.post('/api/auth/login', handleLogin);
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logout bem-sucedido' });
});
app.get('/api/auth/verify', (req, res) => {
  res.json({ success: true, valid: true });
});
app.post('/api/auth/recover', (req, res) => {
  res.json({ success: true, message: 'Email de recuperação enviado com instruções.' });
});

// Legacy index.php API router adapter (for frontend scripts calling /api/index.php)
app.all(['/api/index.php', '/nucleo-estudantes/api/index.php', '/api'], (req, res) => {
  const endpoint = req.body?.endpoint || req.query?.endpoint || '';
  if (endpoint === 'auth/login' || (req.method === 'POST' && req.body?.email)) {
    return handleLogin(req, res);
  }
  if (endpoint === 'auth/logout') {
    return res.json({ success: true });
  }
  if (endpoint === 'noticias' || req.query?.action === 'noticias') {
    return res.json({ success: true, data: noticiasDb });
  }
  if (endpoint === 'eventos' || req.query?.action === 'eventos') {
    return res.json({ success: true, data: eventosDb });
  }
  if (endpoint === 'membros' || req.query?.action === 'membros') {
    return res.json({ success: true, data: membrosDb });
  }
  if (endpoint === 'estatisticas' || req.query?.action === 'estatisticas') {
    return res.json({
      success: true,
      data: {
        noticias: noticiasDb.length,
        eventos: eventosDb.length,
        membros: membrosDb.length,
        mensagens: mensagensDb.length
      }
    });
  }
  return res.json({ success: true, message: 'UCM API v1.0 active' });
});

// Notícias endpoints
app.get('/api/noticias', (req, res) => {
  res.json({ success: true, data: noticiasDb });
});
app.get('/api/noticias/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = noticiasDb.find(n => n.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Notícia não encontrada' });
  res.json({ success: true, data: item });
});
app.post('/api/noticias', (req, res) => {
  const nova = {
    id: noticiasDb.length > 0 ? Math.max(...noticiasDb.map(n => n.id || 0)) + 1 : 1,
    titulo: req.body.titulo || req.body.title || 'Sem título',
    conteudo: req.body.conteudo || req.body.content || '',
    categoria: req.body.categoria || 'geral',
    data_criacao: new Date().toISOString(),
    visualizacoes: 0,
    autor_id: req.body.autor_id || 1
  };
  noticiasDb.unshift(nova);
  saveJSON('noticias.json', noticiasDb);
  res.status(201).json({ success: true, data: nova });
});
app.put('/api/noticias/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = noticiasDb.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Notícia não encontrada' });
  noticiasDb[idx] = { ...noticiasDb[idx], ...req.body };
  saveJSON('noticias.json', noticiasDb);
  res.json({ success: true, data: noticiasDb[idx] });
});
app.delete('/api/noticias/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  noticiasDb = noticiasDb.filter(n => n.id !== id);
  saveJSON('noticias.json', noticiasDb);
  res.json({ success: true, message: 'Notícia excluída' });
});

// Eventos endpoints
app.get('/api/eventos', (req, res) => {
  res.json({ success: true, data: eventosDb });
});
app.get('/api/eventos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = eventosDb.find(e => e.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Evento não encontrado' });
  res.json({ success: true, data: item });
});
app.post('/api/eventos', (req, res) => {
  const novo = {
    id: eventosDb.length > 0 ? Math.max(...eventosDb.map(e => e.id || 0)) + 1 : 1,
    nome: req.body.nome || req.body.title || 'Novo Evento',
    descricao: req.body.descricao || '',
    tipo: req.body.tipo || 'academico',
    data_inicio: req.body.data_inicio || new Date().toISOString(),
    data_fim: req.body.data_fim || new Date().toISOString(),
    local: req.body.local || 'Campus UCM',
    campus: req.body.campus || 'Maputo',
    responsavel_id: req.body.responsavel_id || 1
  };
  eventosDb.push(novo);
  saveJSON('eventos.json', eventosDb);
  res.status(201).json({ success: true, data: novo });
});
app.put('/api/eventos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = eventosDb.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Evento não encontrado' });
  eventosDb[idx] = { ...eventosDb[idx], ...req.body };
  saveJSON('eventos.json', eventosDb);
  res.json({ success: true, data: eventosDb[idx] });
});
app.delete('/api/eventos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  eventosDb = eventosDb.filter(e => e.id !== id);
  saveJSON('eventos.json', eventosDb);
  res.json({ success: true, message: 'Evento excluído' });
});
app.post('/api/eventos/:id/inscricao', (req, res) => {
  const eventoId = parseInt(req.params.id, 10);
  const evento = eventosDb.find(e => e.id === eventoId);
  const inscricao = {
    id: inscricoesDb.length + 1,
    evento_id: eventoId,
    evento_nome: evento ? evento.nome : 'Evento UCM',
    evento_data: evento ? evento.data_inicio : new Date().toISOString(),
    evento_local: evento ? evento.local : 'Campus UCM',
    estudante_codigo: req.body.estudante_codigo || req.body.codigo || '705231198',
    data_inscricao: new Date().toISOString(),
    status: 'confirmado'
  };
  inscricoesDb.push(inscricao);
  saveJSON('inscricoes_eventos.json', inscricoesDb);
  res.status(201).json({ success: true, message: 'Inscrição realizada com sucesso!', data: inscricao });
});

// Membros endpoints
app.get('/api/membros', (req, res) => {
  res.json({ success: true, data: membrosDb });
});
app.get('/api/membros/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = membrosDb.find(m => m.id === id);
  if (!item) return res.status(404).json({ success: false, error: 'Membro não encontrado' });
  res.json({ success: true, data: item });
});
app.post('/api/membros', (req, res) => {
  const novo = {
    id: membrosDb.length > 0 ? Math.max(...membrosDb.map(m => m.id || 0)) + 1 : 1,
    codigo: req.body.codigo || `${Math.floor(100000000 + Math.random() * 900000000)}`,
    nome: req.body.nome || 'Novo Membro',
    email: req.body.email || '',
    campus: req.body.campus || 'Maputo',
    curso: req.body.curso || 'Informática',
    ano_estudo: req.body.ano_estudo || '1º',
    ativo: true,
    perfil: req.body.perfil || 'membro',
    data_inscricao: new Date().toISOString().split('T')[0]
  };
  membrosDb.push(novo);
  saveJSON('membros.json', membrosDb);
  res.status(201).json({ success: true, data: novo });
});
app.put('/api/membros/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = membrosDb.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Membro não encontrado' });
  membrosDb[idx] = { ...membrosDb[idx], ...req.body };
  saveJSON('membros.json', membrosDb);
  res.json({ success: true, data: membrosDb[idx] });
});
app.delete('/api/membros/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  membrosDb = membrosDb.filter(m => m.id !== id);
  saveJSON('membros.json', membrosDb);
  res.json({ success: true, message: 'Membro excluído' });
});

// Galeria endpoints
app.get('/api/galeria', (req, res) => {
  res.json({ success: true, data: fotosDb });
});
app.post('/api/galeria/upload', (req, res) => {
  const novaFoto = {
    id: fotosDb.length + 1,
    descricao: req.body.descricao || 'Nova foto',
    caminho_arquivo: req.body.caminho || 'images/placeholders/galeria1.jpg',
    album: req.body.album || 'Geral',
    data_upload: new Date().toISOString()
  };
  fotosDb.push(novaFoto);
  saveJSON('fotos.json', fotosDb);
  res.status(201).json({ success: true, message: 'Foto enviada com sucesso!', data: novaFoto });
});
app.delete('/api/galeria/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  fotosDb = fotosDb.filter(f => f.id !== id);
  saveJSON('fotos.json', fotosDb);
  res.json({ success: true, message: 'Foto excluída' });
});

// Mensagens & Contato
function handleContact(req, res) {
  const novo = {
    id: mensagensDb.length > 0 ? Math.max(...mensagensDb.map(m => m.id || 0)) + 1 : 1,
    nome: req.body.nome || req.body.name || 'Visitante',
    email: req.body.email || '',
    assunto: req.body.assunto || req.body.subject || 'Mensagem do Site',
    mensagem: req.body.mensagem || req.body.message || '',
    data: new Date().toISOString(),
    lida: false
  };
  mensagensDb.unshift(novo);
  saveJSON('mensagens.json', mensagensDb);
  return res.status(201).json({ success: true, message: 'Mensagem enviada com sucesso!', data: novo });
}

app.post('/api/contato', handleContact);
app.post('/php/send-email.php', handleContact);
app.post('/nucleo-estudantes/php/send-email.php', handleContact);

app.get('/api/mensagens', (req, res) => {
  res.json({ success: true, data: mensagensDb });
});
app.get('/api/mensagens/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const msg = mensagensDb.find(m => m.id === id);
  if (!msg) return res.status(404).json({ success: false, error: 'Mensagem não encontrada' });
  res.json({ success: true, data: msg });
});
app.put('/api/mensagens/:id/lida', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const msg = mensagensDb.find(m => m.id === id);
  if (msg) msg.lida = true;
  saveJSON('mensagens.json', mensagensDb);
  res.json({ success: true });
});
app.post('/api/mensagens/:id/responder', (req, res) => {
  res.json({ success: true, message: 'Resposta registrada com sucesso' });
});
app.delete('/api/mensagens/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  mensagensDb = mensagensDb.filter(m => m.id !== id);
  saveJSON('mensagens.json', mensagensDb);
  res.json({ success: true, message: 'Mensagem excluída' });
});

// Estatísticas
app.get('/api/estatisticas', (req, res) => {
  res.json({
    success: true,
    data: {
      noticias: noticiasDb.length,
      eventos: eventosDb.length,
      membros: membrosDb.length,
      mensagens: mensagensDb.length,
      fotos: fotosDb.length
    }
  });
});
app.get('/api/estatisticas/periodo', (req, res) => {
  res.json({
    success: true,
    data: {
      periodo: '2026',
      total_acessos: 1420,
      novos_membros: membrosDb.length,
      eventos_realizados: eventosDb.length
    }
  });
});

// Configurações
app.get('/api/configuracoes', (req, res) => {
  res.json({
    success: true,
    data: {
      nome_site: "Núcleo dos Estudantes - FCS UCM",
      email_contacto: "admin@nucleo.ucm.ac.mz",
      telefone: "+258 84 123 4567",
      campus_principal: "Maputo"
    }
  });
});
app.put('/api/configuracoes', (req, res) => {
  res.json({ success: true, message: 'Configurações salvas com sucesso' });
});

// Rewriting /nucleo-estudantes/* to root files
app.use((req, res, next) => {
  if (req.url.startsWith('/nucleo-estudantes/')) {
    req.url = req.url.replace('/nucleo-estudantes/', '/');
  }
  next();
});

// Static file serving
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html'
}));

// Fallback to index.html for root or unknown route without file extension
app.get('*', (req, res) => {
  const targetFile = path.join(__dirname, req.path);
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
    return res.sendFile(targetFile);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
