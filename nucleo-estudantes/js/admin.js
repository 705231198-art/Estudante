/**
 * PAINEL ADMINISTRATIVO - Núcleo dos Estudantes UCM
 * Responsável pelo gerenciamento de conteúdo do site
 */

class AdminManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.noticias = [];
        this.eventos = [];
        this.mensagens = [];
        this.usuario = null;
        
        this.init();
    }
    
    init() {
        console.log('🛠️ Admin Manager inicializado');
        
        // Verificar autenticação
        this.verificarAutenticacao();
        
        // Carregar dados
        this.carregarDadosIniciais();
        
        // Configurar navegação
        this.setupNavegacao();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar dashboard inicial
        this.carregarDashboard();
    }
    
    verificarAutenticacao() {
        const token = localStorage.getItem('ucm_token');
        const usuarioSalvo = localStorage.getItem('ucm_estudante');
        
        if (!token || !usuarioSalvo) {
            window.location.href = 'index.html';
            return;
        }
        
        this.usuario = JSON.parse(usuarioSalvo);
        this.atualizarInterfaceUsuario();
    }
    
    atualizarInterfaceUsuario() {
        // Atualizar nome do usuário
        const adminName = document.getElementById('adminName');
        if (adminName && this.usuario) {
            adminName.textContent = this.usuario.nome || 'Administrador';
        }
        
        // Atualizar email no footer
        const userEmail = document.querySelector('.user-details small');
        if (userEmail && this.usuario) {
            userEmail.textContent = this.usuario.email;
        }
    }
    
    carregarDadosIniciais() {
        // Carregar notícias
        this.noticias = this.carregarNoticiasDoStorage();
        
        // Carregar eventos
        this.eventos = this.carregarEventosDoStorage();
        
        // Carregar mensagens
        this.mensagens = this.carregarMensagensDoStorage();
    }
    
    carregarNoticiasDoStorage() {
        const noticiasSalvas = localStorage.getItem('ucm_noticias');
        if (noticiasSalvas) {
            return JSON.parse(noticiasSalvas);
        }
        
        // Notícias de exemplo
        return [
            {
                id: 1,
                titulo: 'Bem-vindo ao Novo Site do Núcleo UCM',
                conteudo: 'Estamos felizes em anunciar o lançamento do nosso novo site!',
                imagem: 'images/placeholders/noticia1.jpg',
                data: new Date().toISOString(),
                autor: 'Administrador',
                status: 'publicada',
                visualizacoes: 1245
            },
            {
                id: 2,
                titulo: 'Semana Acadêmica 2024',
                conteudo: 'Prepare-se para a maior semana académica do ano!',
                imagem: 'images/placeholders/noticia2.jpg',
                data: new Date(Date.now() - 86400000).toISOString(),
                autor: 'Comissão Acadêmica',
                status: 'publicada',
                visualizacoes: 892
            }
        ];
    }
    
    carregarEventosDoStorage() {
        const eventosSalvos = localStorage.getItem('ucm_eventos');
        if (eventosSalvos) {
            return JSON.parse(eventosSalvos);
        }
        return [];
    }
    
    carregarMensagensDoStorage() {
        const mensagensSalvas = localStorage.getItem('ucm_mensagens');
        if (mensagensSalvas) {
            return JSON.parse(mensagensSalvas);
        }
        return [];
    }
    
    setupNavegacao() {
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        const sections = document.querySelectorAll('.content-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover active de todos
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                // Adicionar active ao link clicado
                link.classList.add('active');
                
                // Mostrar seção correspondente
                const targetId = link.getAttribute('href').substring(1);
                this.currentSection = targetId;
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.classList.add('active');
                    this.carregarSecao(targetId);
                }
            });
        });
    }
    
    setupEventListeners() {
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.fazerLogout();
        });
        
        // Refresh
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.carregarSecao(this.currentSection);
        });
        
        // Ações rápidas
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.executarAcaoRapida(action);
            });
        });
        
        // Notícias
        document.getElementById('addNoticiaBtn')?.addEventListener('click', () => {
            this.mostrarEditorNoticia();
        });
        
        document.getElementById('cancelNoticiaBtn')?.addEventListener('click', () => {
            this.esconderEditorNoticia();
        });
        
        document.getElementById('saveNoticiaBtn')?.addEventListener('click', () => {
            this.salvarNoticia();
        });
        
        // Mensagens
        document.getElementById('markAllRead')?.addEventListener('click', () => {
            this.marcarTodasComoLidas();
        });
    }
    
    carregarSecao(secaoId) {
        switch(secaoId) {
            case 'dashboard':
                this.carregarDashboard();
                break;
            case 'noticias':
                this.carregarNoticias();
                break;
            case 'eventos':
                this.carregarEventos();
                break;
            case 'galeria':
                this.carregarGaleria();
                break;
            case 'membros':
                this.carregarMembros();
                break;
            case 'mensagens':
                this.carregarMensagens();
                break;
            case 'configuracoes':
                this.carregarConfiguracoes();
                break;
        }
    }
    
    // ==========================================================================
    // DASHBOARD
    // ==========================================================================
    
    carregarDashboard() {
        // Atualizar estatísticas
        this.atualizarEstatisticas();
        
        // Carregar atividades recentes
        this.carregarAtividadesRecentes();
        
        // Carregar notificações
        this.carregarNotificacoes();
    }
    
    atualizarEstatisticas() {
        // Em produção, viriam de uma API
        const stats = {
            visitas: 1245,
            mensagens: this.mensagens.filter(m => !m.lida).length,
            membros: 156,
            eventos: this.eventos.filter(e => new Date(e.start) > new Date()).length
        };
        
        // Atualizar elementos
        document.querySelectorAll('.stat-info h3').forEach((el, index) => {
            const values = Object.values(stats);
            if (values[index] !== undefined) {
                el.textContent = values[index];
            }
        });
    }
    
    carregarAtividadesRecentes() {
        const container = document.getElementById('activityList');
        if (!container) return;
        
        const atividades = [
            {
                id: 1,
                tipo: 'noticia',
                acao: 'publicou uma nova notícia',
                usuario: this.usuario?.nome || 'Administrador',
                detalhes: 'Bem-vindo ao Novo Site do Núcleo UCM',
                tempo: 'há 2 horas',
                icone: 'newspaper'
            },
            {
                id: 2,
                tipo: 'evento',
                acao: 'criou um novo evento',
                usuario: 'Comissão Acadêmica',
                detalhes: 'Semana Acadêmica 2024',
                tempo: 'há 1 dia',
                icone: 'calendar-plus'
            },
            {
                id: 3,
                tipo: 'mensagem',
                acao: 'recebeu uma nova mensagem',
                usuario: 'Visitante',
                detalhes: 'Consulta sobre inscrições',
                tempo: 'há 2 dias',
                icone: 'envelope'
            },
            {
                id: 4,
                tipo: 'galeria',
                acao: 'adicionou novas fotos',
                usuario: 'Comissão Cultural',
                detalhes: '12 fotos da Noite Cultural',
                tempo: 'há 3 dias',
                icone: 'images'
            }
        ];
        
        container.innerHTML = '';
        
        atividades.forEach(atividade => {
            const div = document.createElement('div');
            div.className = 'activity-item';
            div.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${atividade.icone}"></i>
                </div>
                <div class="activity-content">
                    <h4>${atividade.usuario} ${atividade.acao}</h4>
                    <p>${atividade.detalhes}</p>
                </div>
                <div class="activity-time">${atividade.tempo}</div>
            `;
            container.appendChild(div);
        });
    }
    
    carregarNotificacoes() {
        // Em produção, viriam do servidor
        const notificacoes = this.mensagens
            .filter(m => !m.lida)
            .slice(0, 5)
            .map(m => ({
                id: m.id,
                titulo: `Nova mensagem de ${m.nome}`,
                conteudo: m.mensagem.substring(0, 100) + '...',
                tipo: 'mensagem'
            }));
        
        // Atualizar badge
        const badge = document.querySelector('.sidebar-nav a[href="#mensagens"] .badge');
        if (badge) {
            badge.textContent = notificacoes.length;
            badge.style.display = notificacoes.length > 0 ? 'inline-block' : 'none';
        }
    }
    
    // ==========================================================================
    // NOTÍCIAS
    // ==========================================================================
    
    carregarNoticias() {
        const container = document.getElementById('noticiasList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.noticias.forEach(noticia => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${noticia.titulo}</td>
                <td>${new Date(noticia.data).toLocaleDateString('pt-BR')}</td>
                <td>
                    <span class="status-badge ${noticia.status}">
                        ${noticia.status === 'publicada' ? 'Publicada' : 'Rascunho'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon edit" data-id="${noticia.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" data-id="${noticia.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon view" data-id="${noticia.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            container.appendChild(tr);
        });
        
        // Adicionar event listeners aos botões
        this.setupBotoesNoticias();
    }
    
    setupBotoesNoticias() {
        // Editar
        document.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.editarNoticia(id);
            });
        });
        
        // Excluir
        document.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.excluirNoticia(id);
            });
        });
        
        // Visualizar
        document.querySelectorAll('.btn-icon.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.visualizarNoticia(id);
            });
        });
    }
    
    mostrarEditorNoticia(noticia = null) {
        const editor = document.getElementById('noticiaEditor');
        if (!editor) return;
        
        editor.style.display = 'block';
        
        if (noticia) {
            // Modo edição
            document.getElementById('noticiaTitulo').value = noticia.titulo || '';
            document.getElementById('noticiaConteudo').value = noticia.conteudo || '';
            document.getElementById('noticiaImagem').value = noticia.imagem || '';
            document.getElementById('saveNoticiaBtn').dataset.mode = 'edit';
            document.getElementById('saveNoticiaBtn').dataset.id = noticia.id;
            document.getElementById('saveNoticiaBtn').textContent = 'Atualizar Notícia';
        } else {
            // Modo criação
            document.getElementById('noticiaTitulo').value = '';
            document.getElementById('noticiaConteudo').value = '';
            document.getElementById('noticiaImagem').value = '';
            document.getElementById('saveNoticiaBtn').dataset.mode = 'create';
            delete document.getElementById('saveNoticiaBtn').dataset.id;
            document.getElementById('saveNoticiaBtn').textContent = 'Publicar Notícia';
        }
        
        // Scroll para o editor
        editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    esconderEditorNoticia() {
        const editor = document.getElementById('noticiaEditor');
        if (editor) {
            editor.style.display = 'none';
        }
    }
    
    salvarNoticia() {
        const titulo = document.getElementById('noticiaTitulo').value.trim();
        const conteudo = document.getElementById('noticiaConteudo').value.trim();
        const imagem = document.getElementById('noticiaImagem').value.trim();
        const mode = document.getElementById('saveNoticiaBtn').dataset.mode;
        const id = document.getElementById('saveNoticiaBtn').dataset.id;
        
        // Validação
        if (!titulo || !conteudo) {
            this.mostrarAlerta('Por favor, preencha título e conteúdo.', 'error');
            return;
        }
        
        const noticia = {
            titulo,
            conteudo,
            imagem: imagem || 'images/placeholders/noticia-default.jpg',
            data: new Date().toISOString(),
            autor: this.usuario?.nome || 'Administrador',
            status: 'publicada',
            visualizacoes: 0
        };
        
        if (mode === 'edit' && id) {
            // Editar notícia existente
            const index = this.noticias.findIndex(n => n.id === parseInt(id));
            if (index !== -1) {
                noticia.id = parseInt(id);
                noticia.visualizacoes = this.noticias[index].visualizacoes;
                this.noticias[index] = noticia;
                this.mostrarAlerta('Notícia atualizada com sucesso!', 'success');
            }
        } else {
            // Criar nova notícia
            noticia.id = this.noticias.length > 0 ? Math.max(...this.noticias.map(n => n.id)) + 1 : 1;
            this.noticias.unshift(noticia);
            this.mostrarAlerta('Notícia publicada com sucesso!', 'success');
        }
        
        // Salvar no localStorage
        this.salvarNoticiasNoStorage();
        
        // Atualizar lista
        this.carregarNoticias();
        
        // Esconder editor
        this.esconderEditorNoticia();
        
        // Atualizar dashboard
        this.carregarDashboard();
    }
    
    editarNoticia(id) {
        const noticia = this.noticias.find(n => n.id === id);
        if (noticia) {
            this.mostrarEditorNoticia(noticia);
        }
    }
    
    excluirNoticia(id) {
        if (confirm('Tem certeza que deseja excluir esta notícia?')) {
            const index = this.noticias.findIndex(n => n.id === id);
            if (index !== -1) {
                this.noticias.splice(index, 1);
                this.salvarNoticiasNoStorage();
                this.carregarNoticias();
                this.mostrarAlerta('Notícia excluída com sucesso!', 'success');
            }
        }
    }
    
    visualizarNoticia(id) {
        const noticia = this.noticias.find(n => n.id === id);
        if (noticia) {
            // Em produção, abriria em uma nova aba ou modal
            alert(`Visualizando: ${noticia.titulo}\n\n${noticia.conteudo.substring(0, 200)}...`);
        }
    }
    
    salvarNoticiasNoStorage() {
        localStorage.setItem('ucm_noticias', JSON.stringify(this.noticias));
    }
    
    // ==========================================================================
    // EVENTOS
    // ==========================================================================
    
    carregarEventos() {
        // Integrar com o CalendarioManager se disponível
        if (window.calendarioManager) {
            this.eventos = window.calendarioManager.eventos;
        }
        
        // Em produção, carregaria do servidor
        console.log('Eventos carregados:', this.eventos.length);
    }
    
    // ==========================================================================
    // GALERIA
    // ==========================================================================
    
    carregarGaleria() {
        // Integrar com o GaleriaManager se disponível
        if (window.galeriaManager) {
            // Carregar interface de upload e gerenciamento
            this.carregarInterfaceGaleria();
        }
    }
    
    carregarInterfaceGaleria() {
        const section = document.getElementById('galeria');
        if (!section) return;
        
        section.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-images"></i> Gerenciar Galeria</h2>
                <button class="btn btn-primary" id="uploadFotosBtn">
                    <i class="fas fa-cloud-upload-alt"></i> Upload de Fotos
                </button>
            </div>
            
            <div class="upload-container" id="uploadContainer" style="display: none;">
                <h3><i class="fas fa-upload"></i> Upload de Fotos</h3>
                <div class="upload-area" id="uploadArea">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Arraste e solte fotos aqui ou clique para selecionar</p>
                    <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
                    <button class="btn btn-outline" id="selectFilesBtn">Selecionar Fotos</button>
                </div>
                <div class="upload-progress" id="uploadProgress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <span id="progressText">0%</span>
                </div>
                <div class="uploaded-files" id="uploadedFiles"></div>
                <div class="form-actions">
                    <button class="btn-secondary" id="cancelUpload">Cancelar</button>
                    <button class="btn-primary" id="startUpload" disabled>Iniciar Upload</button>
                </div>
            </div>
            
            <div class="galeria-admin">
                <h3>Fotos na Galeria: <span id="totalFotos">0</span></h3>
                <div class="filtros-admin">
                    <input type="text" id="searchPhotos" placeholder="Buscar fotos...">
                    <select id="filterCategory">
                        <option value="">Todas as categorias</option>
                        <option value="academicos">Acadêmicos</option>
                        <option value="culturais">Culturais</option>
                        <option value="desportivos">Desportivos</option>
                        <option value="social">Social</option>
                    </select>
                    <select id="filterCampus">
                        <option value="">Todos os campus</option>
                        <option value="Maputo">Maputo</option>
                        <option value="Beira">Beira</option>
                        <option value="Nampula">Nampula</option>
                        <option value="Quelimane">Quelimane</option>
                        <option value="Pemba">Pemba</option>
                    </select>
                </div>
                <div class="photos-grid" id="photosGrid">
                    <!-- Fotos serão carregadas aqui -->
                </div>
            </div>
        `;
        
        this.setupUploadGaleria();
    }
    
    setupUploadGaleria() {
        // Implementar upload de fotos
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const selectFilesBtn = document.getElementById('selectFilesBtn');
        
        if (uploadArea && fileInput && selectFilesBtn) {
            selectFilesBtn.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                if (e.dataTransfer.files.length) {
                    this.processarArquivos(e.dataTransfer.files);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    this.processarArquivos(e.target.files);
                }
            });
        }
    }
    
    processarArquivos(files) {
        // Implementar processamento de arquivos
        console.log('Arquivos selecionados:', files.length);
        
        // Mostrar preview das imagens
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (uploadedFiles) {
            uploadedFiles.innerHTML = '';
            
            Array.from(files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const div = document.createElement('div');
                        div.className = 'uploaded-file';
                        div.innerHTML = `
                            <img src="${e.target.result}" alt="${file.name}">
                            <div class="file-info">
                                <span>${file.name}</span>
                                <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                            </div>
                            <button class="btn-icon remove-file" data-index="${index}">
                                <i class="fas fa-times"></i>
                            </button>
                        `;
                        uploadedFiles.appendChild(div);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Habilitar botão de upload
            document.getElementById('startUpload')?.removeAttribute('disabled');
        }
    }
    
    // ==========================================================================
    // MEMBROS
    // ==========================================================================
    
    carregarMembros() {
        // Em produção, carregaria do servidor
        const section = document.getElementById('membros');
        if (!section) return;
        
        section.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-users"></i> Gerenciar Membros</h2>
                <button class="btn btn-primary" id="addMembroBtn">
                    <i class="fas fa-user-plus"></i> Adicionar Membro
                </button>
            </div>
            
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Cargo</th>
                            <th>Campus</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="membrosList">
                        <!-- Membros serão carregados aqui -->
                    </tbody>
                </table>
            </div>
        `;
        
        this.carregarListaMembros();
    }
    
    carregarListaMembros() {
        const container = document.getElementById('membrosList');
        if (!container) return;
        
        // Membros de exemplo
        const membros = [
            {
                id: 1,
                nome: 'João Maputo',
                cargo: 'Presidente',
                campus: 'Maputo',
                email: 'joao.maputo@ucm.ac.mz',
                status: 'ativo',
                telefone: '+258 84 123 4567'
            },
            {
                id: 2,
                nome: 'Maria Beira',
                cargo: 'Vice-Presidente',
                campus: 'Beira',
                email: 'maria.beira@ucm.ac.mz',
                status: 'ativo',
                telefone: '+258 84 234 5678'
            },
            {
                id: 3,
                nome: 'Carlos Nampula',
                cargo: 'Secretário-Geral',
                campus: 'Nampula',
                email: 'carlos.nampula@ucm.ac.mz',
                status: 'ativo',
                telefone: '+258 84 345 6789'
            }
        ];
        
        container.innerHTML = '';
        
        membros.forEach(membro => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${membro.nome}</td>
                <td>${membro.cargo}</td>
                <td>${membro.campus}</td>
                <td>${membro.email}</td>
                <td>
                    <span class="status-badge ${membro.status}">
                        ${membro.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon edit" data-id="${membro.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" data-id="${membro.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon view" data-id="${membro.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            container.appendChild(tr);
        });
    }
    
    // ==========================================================================
    // MENSAGENS
    // ==========================================================================
    
    carregarMensagens() {
        const section = document.getElementById('mensagens');
        if (!section) return;
        
        section.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-envelope"></i> Mensagens Recebidas</h2>
                <div class="header-actions">
                    <button class="btn btn-outline" id="markAllRead">
                        <i class="fas fa-check-double"></i> Marcar Todas como Lidas
                    </button>
                    <button class="btn btn-primary" id="exportMessages">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>
            
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Assunto</th>
                            <th>Data</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="mensagensList">
                        <!-- Mensagens serão carregadas aqui -->
                    </tbody>
                </table>
            </div>
        `;
        
        this.carregarListaMensagens();
        this.setupBotoesMensagens();
    }
    
    carregarListaMensagens() {
        const container = document.getElementById('mensagensList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.mensagens.forEach(mensagem => {
            const tr = document.createElement('tr');
            tr.className = mensagem.lida ? '' : 'unread';
            tr.innerHTML = `
                <td>${mensagem.nome}</td>
                <td>${mensagem.email}</td>
                <td>${mensagem.assunto}</td>
                <td>${new Date(mensagem.data).toLocaleDateString('pt-BR')}</td>
                <td>
                    <span class="status-badge ${mensagem.lida ? 'lida' : 'nao-lida'}">
                        ${mensagem.lida ? 'Lida' : 'Não lida'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon view" data-id="${mensagem.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon delete" data-id="${mensagem.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon reply" data-id="${mensagem.id}">
                        <i class="fas fa-reply"></i>
                    </button>
                </td>
            `;
            container.appendChild(tr);
        });
    }
    
    setupBotoesMensagens() {
        // Marcar como lida
        document.querySelectorAll('.btn-icon.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.visualizarMensagem(id);
            });
        });
        
        // Excluir
        document.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.excluirMensagem(id);
            });
        });
        
        // Responder
        document.querySelectorAll('.btn-icon.reply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.responderMensagem(id);
            });
        });
        
        // Marcar todas como lidas
        document.getElementById('markAllRead')?.addEventListener('click', () => {
            this.marcarTodasComoLidas();
        });
        
        // Exportar
        document.getElementById('exportMessages')?.addEventListener('click', () => {
            this.exportarMensagens();
        });
    }
    
    visualizarMensagem(id) {
        const mensagem = this.mensagens.find(m => m.id === parseInt(id));
        if (mensagem) {
            // Marcar como lida
            mensagem.lida = true;
            this.salvarMensagensNoStorage();
            
            // Mostrar modal com detalhes
            const modalHTML = `
                <div class="modal-content">
                    <h3>${mensagem.assunto}</h3>
                    <div class="message-meta">
                        <p><strong>De:</strong> ${mensagem.nome} &lt;${mensagem.email}&gt;</p>
                        <p><strong>Data:</strong> ${new Date(mensagem.data).toLocaleString('pt-BR')}</p>
                        ${mensagem.campus ? `<p><strong>Campus:</strong> ${mensagem.campus}</p>` : ''}
                    </div>
                    <div class="message-body">
                        <h4>Mensagem:</h4>
                        <p>${mensagem.mensagem}</p>
                    </div>
                    <div class="message-actions">
                        <button class="btn btn-secondary" id="closeMessage">Fechar</button>
                        <button class="btn btn-primary" id="replyMessage">
                            <i class="fas fa-reply"></i> Responder
                        </button>
                    </div>
                </div>
            `;
            
            this.mostrarModal('Detalhes da Mensagem', modalHTML);
            
            // Configurar botões do modal
            document.getElementById('closeMessage')?.addEventListener('click', () => {
                this.fecharModal();
                this.carregarListaMensagens();
            });
            
            document.getElementById('replyMessage')?.addEventListener('click', () => {
                this.fecharModal();
                this.responderMensagem(id);
            });
        }
    }
    
    excluirMensagem(id) {
        if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
            const index = this.mensagens.findIndex(m => m.id === parseInt(id));
            if (index !== -1) {
                this.mensagens.splice(index, 1);
                this.salvarMensagensNoStorage();
                this.carregarListaMensagens();
                this.mostrarAlerta('Mensagem excluída com sucesso!', 'success');
            }
        }
    }
    
    responderMensagem(id) {
        const mensagem = this.mensagens.find(m => m.id === parseInt(id));
        if (mensagem) {
            // Em produção, abriria editor de email
            alert(`Respondendo para: ${mensagem.nome} <${mensagem.email}>\n\nAssunto: Re: ${mensagem.assunto}`);
        }
    }
    
    marcarTodasComoLidas() {
        this.mensagens.forEach(m => m.lida = true);
        this.salvarMensagensNoStorage();
        this.carregarListaMensagens();
        this.mostrarAlerta('Todas as mensagens foram marcadas como lidas!', 'success');
    }
    
    exportarMensagens() {
        const dados = {
            exportadoEm: new Date().toISOString(),
            totalMensagens: this.mensagens.length,
            mensagens: this.mensagens
        };
        
        // Criar arquivo JSON para download
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mensagens-ucm-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    salvarMensagensNoStorage() {
        localStorage.setItem('ucm_mensagens', JSON.stringify(this.mensagens));
    }
    
    // ==========================================================================
    // CONFIGURAÇÕES
    // ==========================================================================
    
    carregarConfiguracoes() {
        const section = document.getElementById('configuracoes');
        if (!section) return;
        
        section.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-cog"></i> Configurações do Sistema</h2>
            </div>
            
            <div class="settings-grid">
                <div class="settings-card">
                    <h3><i class="fas fa-user-cog"></i> Configurações da Conta</h3>
                    <form id="accountSettings">
                        <div class="form-group">
                            <label>Nome de Exibição</label>
                            <input type="text" id="displayName" value="${this.usuario?.nome || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" value="${this.usuario?.email || ''}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Campus Principal</label>
                            <select id="mainCampus">
                                <option value="Maputo" ${this.usuario?.campus === 'Maputo' ? 'selected' : ''}>Maputo</option>
                                <option value="Beira" ${this.usuario?.campus === 'Beira' ? 'selected' : ''}>Beira</option>
                                <option value="Nampula" ${this.usuario?.campus === 'Nampula' ? 'selected' : ''}>Nampula</option>
                                <option value="Quelimane" ${this.usuario?.campus === 'Quelimane' ? 'selected' : ''}>Quelimane</option>
                                <option value="Pemba" ${this.usuario?.campus === 'Pemba' ? 'selected' : ''}>Pemba</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                    </form>
                </div>
                
                <div class="settings-card">
                    <h3><i class="fas fa-bell"></i> Notificações</h3>
                    <form id="notificationSettings">
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="notifyNewMessages" checked>
                                <span>Novas mensagens</span>
                            </label>
                            <label>
                                <input type="checkbox" id="notifyEventReminders" checked>
                                <span>Lembretes de eventos</span>
                            </label>
                            <label>
                                <input type="checkbox" id="notifySystemUpdates" checked>
                                <span>Atualizações do sistema</span>
                            </label>
                        </div>
                        <button type="submit" class="btn btn-primary">Salvar Preferências</button>
                    </form>
                </div>
                
                <div class="settings-card">
                    <h3><i class="fas fa-shield-alt"></i> Segurança</h3>
                    <form id="securitySettings">
                        <div class="form-group">
                            <label>Alterar Senha</label>
                            <input type="password" id="currentPassword" placeholder="Senha atual">
                        </div>
                        <div class="form-group">
                            <input type="password" id="newPassword" placeholder="Nova senha">
                        </div>
                        <div class="form-group">
                            <input type="password" id="confirmPassword" placeholder="Confirmar nova senha">
                        </div>
                        <button type="submit" class="btn btn-primary">Alterar Senha</button>
                    </form>
                </div>
                
                <div class="settings-card">
                    <h3><i class="fas fa-database"></i> Manutenção</h3>
                    <div class="maintenance-actions">
                        <button class="btn btn-outline" id="clearCache">
                            <i class="fas fa-broom"></i> Limpar Cache
                        </button>
                        <button class="btn btn-outline" id="exportData">
                            <i class="fas fa-download"></i> Exportar Dados
                        </button>
                        <button class="btn btn-danger" id="resetSystem">
                            <i class="fas fa-redo"></i> Redefinir Sistema
                        </button>
                    </div>
                    <div class="system-info">
                        <h4>Informações do Sistema</h4>
                        <p><strong>Versão:</strong> 1.0.0</p>
                        <p><strong>Último backup:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                        <p><strong>Espaço usado:</strong> ${localStorage.length} KB</p>
                    </div>
                </div>
            </div>
        `;
        
        this.setupConfiguracoes();
    }
    
    setupConfiguracoes() {
        // Configurações da conta
        document.getElementById('accountSettings')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarConfiguracoesConta();
        });
        
        // Notificações
        document.getElementById('notificationSettings')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarConfiguracoesNotificacoes();
        });
        
        // Segurança
        document.getElementById('securitySettings')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.alterarSenha();
        });
        
        // Manutenção
        document.getElementById('clearCache')?.addEventListener('click', () => {
            this.limparCache();
        });
        
        document.getElementById('exportData')?.addEventListener('click', () => {
            this.exportarTodosDados();
        });
        
        document.getElementById('resetSystem')?.addEventListener('click', () => {
            this.redefinirSistema();
        });
    }
    
    salvarConfiguracoesConta() {
        const displayName = document.getElementById('displayName').value;
        const mainCampus = document.getElementById('mainCampus').value;
        
        // Atualizar usuário
        if (this.usuario) {
            this.usuario.nome = displayName;
            this.usuario.campus = mainCampus;
            
            // Salvar no localStorage
            localStorage.setItem('ucm_estudante', JSON.stringify(this.usuario));
            
            // Atualizar interface
            this.atualizarInterfaceUsuario();
            
            this.mostrarAlerta('Configurações da conta salvas com sucesso!', 'success');
        }
    }
    
    salvarConfiguracoesNotificacoes() {
        // Em produção, salvaria no servidor
        this.mostrarAlerta('Preferências de notificação salvas!', 'success');
    }
    
    alterarSenha() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validação
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.mostrarAlerta('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.mostrarAlerta('As novas senhas não coincidem.', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.mostrarAlerta('A nova senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        // Em produção, validaria a senha atual com o servidor
        // Por enquanto, simulação
        this.mostrarAlerta('Senha alterada com sucesso!', 'success');
        
        // Limpar campos
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
    
    limparCache() {
        // Limpar cache do localStorage (exceto dados essenciais)
        const essentialKeys = ['ucm_estudante', 'ucm_token', 'ucm_noticias', 'ucm_eventos', 'ucm_mensagens'];
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!essentialKeys.includes(key)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        this.mostrarAlerta('Cache limpo com sucesso!', 'success');
        this.carregarConfiguracoes(); // Recarregar para atualizar info do sistema
    }
    
    exportarTodosDados() {
        const dados = {
            exportadoEm: new Date().toISOString(),
            usuario: this.usuario,
            noticias: this.noticias,
            eventos: this.eventos,
            mensagens: this.mensagens,
            configuracao: {
                version: '1.0.0',
                storageUsed: localStorage.length
            }
        };
        
        // Criar arquivo JSON para download
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-ucm-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarAlerta('Backup exportado com sucesso!', 'success');
    }
    
    redefinirSistema() {
        if (confirm('ATENÇÃO: Esta ação irá redefinir todos os dados do sistema. Tem certeza?')) {
            if (confirm('Esta ação é irreversível. Digite "REDEFINIR" para confirmar:') === 'REDEFINIR') {
                // Limpar tudo exceto credenciais
                const usuario = this.usuario;
                const token = localStorage.getItem('ucm_token');
                
                localStorage.clear();
                
                // Restaurar credenciais
                if (usuario) localStorage.setItem('ucm_estudante', JSON.stringify(usuario));
                if (token) localStorage.setItem('ucm_token', token);
                
                // Recarregar página
                window.location.reload();
            }
        }
    }
    
    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================
    
    executarAcaoRapida(acao) {
        switch(acao) {
            case 'add-news':
                this.mostrarEditorNoticia();
                break;
            case 'add-event':
                // Navegar para eventos
                document.querySelector('.sidebar-nav a[href="#eventos"]')?.click();
                break;
            case 'upload-photo':
                // Mostrar upload de fotos
                document.querySelector('.sidebar-nav a[href="#galeria"]')?.click();
                setTimeout(() => {
                    document.getElementById('uploadFotosBtn')?.click();
                }, 100);
                break;
            case 'view-messages':
                document.querySelector('.sidebar-nav a[href="#mensagens"]')?.click();
                break;
        }
    }
    
    fazerLogout() {
        // Limpar dados de autenticação
        localStorage.removeItem('ucm_token');
        
        // Redirecionar para login
        window.location.href = 'index.html';
    }
    
    mostrarAlerta(mensagem, tipo = 'info') {
        // Usar sistema de notificação do site principal se disponível
        if (window.ucmSite && typeof window.ucmSite.showNotification === 'function') {
            window.ucmSite.showNotification(mensagem, tipo);
        } else {
            alert(mensagem);
        }
    }
    
    mostrarModal(titulo, conteudo) {
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${titulo}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                ${conteudo}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fechar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    fecharModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }
}

// Inicializar admin quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.admin-container')) {
        window.adminManager = new AdminManager();
    }
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminManager };
}