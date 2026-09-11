/**
 * MembrosManager - Gerenciador do Portal de Membros
 * Responsável por toda a funcionalidade da área de membros
 */
class MembrosManager {
    constructor() {
        this.estudante = this.carregarDadosUsuario();
        this.eventoAtualSelecionado = null;
        this.init();
    }

    /**
     * Inicializa o portal e configura eventos
     */
    init() {
        if (!this.estudante) {
            // `carregarDadosUsuario()` já agenda o logout/redirecionamento e mostra
            // um overlay de diagnóstico. Não redirecionar imediatamente para
            // permitir inspeção e migração das chaves de sessão.
            return;
        }

        this._configurarElementosDOM();
        this._configurarEventListeners();
        this.carregarDashboard();
    }

    /**
     * Carrega dados do usuário do localStorage
     */
    carregarDadosUsuario() {
        const token = localStorage.getItem('ucm_token');
        const estudante = localStorage.getItem('ucm_estudante');
        // Compatibilidade: verificar chaves legadas
        const legacyToken = localStorage.getItem('token') || localStorage.getItem('ucm_token_legacy');
        const legacyEstudante = localStorage.getItem('ucm_usuario') || localStorage.getItem('estudante') || localStorage.getItem('usuario');

        // Se valores legados existirem, migrar para chaves atuais
        if (!token && legacyToken) {
            localStorage.setItem('ucm_token', legacyToken);
        }
        if (!estudante && legacyEstudante) {
            localStorage.setItem('ucm_estudante', legacyEstudante);
        }

        const tokenFinal = localStorage.getItem('ucm_token');
        const estudanteFinal = localStorage.getItem('ucm_estudante');

        if (!tokenFinal || !estudanteFinal) {
            console.warn('MembrosManager: token ou estudante ausente - iniciando em modo visitante', { token, estudante });

            // Não forçar logout; permitir acesso em modo visitante com capacidades limitadas
            const visitante = {
                nome: 'Visitante',
                email: '',
                codigo: 'guest',
                perfil: 'visitante',
                campus: '',
                curso: '',
                ano: ''
            };

            // Não gravar token/estudante no localStorage, apenas retornar o objeto
            this.isVisitante = true;
            return visitante;
        }

        try {
            this.isVisitante = false;
            return JSON.parse(estudanteFinal);
        } catch (e) {
            console.error('Erro ao carregar dados do usuário:', e);
            // Se dados corrompidos, retornar visitante em vez de forçar logout
            this.isVisitante = true;
            return {
                nome: 'Visitante',
                email: '',
                codigo: 'guest',
                perfil: 'visitante'
            };
        }
    }

    /**
     * Armazena referências aos elementos DOM principais
     */
    _configurarElementosDOM() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.contentSections = document.querySelectorAll('.content-section');
        this.modal = document.getElementById('eventoModal');
        this.modalClose = document.querySelector('.modal-close');
        this.modalCloseBtn = document.querySelector('.modal-close-btn');
        this.inscreverBtn = document.getElementById('inscreverBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        
        // Preencher nome do utilizador no header
        const userNameEl = document.getElementById('userName');
        if (userNameEl && this.estudante) {
            userNameEl.textContent = this.estudante.nome || 'Utilizador';
        }
        
        // Dropdown do menu de utilizador
        const userToggle = document.getElementById('userToggle');
        const userDropdown = document.getElementById('userDropdown');
        if (userToggle && userDropdown) {
            userToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
            });
            
            // Fechar dropdown ao clicar fora
            document.addEventListener('click', () => {
                userDropdown.style.display = 'none';
            });
        }
    }

    /**
     * Configura todos os event listeners
     */
    _configurarEventListeners() {
        // Navegação
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.mostrarSecao(section);
            });
        });

        // Modal
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.fecharModal());
        }
        if (this.modalCloseBtn) {
            this.modalCloseBtn.addEventListener('click', () => this.fecharModal());
        }
        if (this.inscreverBtn) {
            this.inscreverBtn.addEventListener('click', () => this.inscreverEmEvento());
        }

        // Atualizar
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.carregarDashboard());
        }

        // Botões de ação de perfil
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.mostrarFormularioEditarPerfil());
        }

        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.mostrarFormularioAlterarSenha());
        }

        // Busca de eventos
        const eventSearch = document.getElementById('eventSearch');
        const eventTypeFilter = document.getElementById('eventTypeFilter');
        const campusFilter = document.getElementById('campusFilter');
        
        if (eventSearch) eventSearch.addEventListener('input', () => this.filtrarEventos());
        if (eventTypeFilter) eventTypeFilter.addEventListener('change', () => this.filtrarEventos());
        if (campusFilter) campusFilter.addEventListener('change', () => this.filtrarEventos());

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.fazerLogout());
        }

        // Modal - clique fora fecha
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.fecharModal();
            }
        });
    }

    /**
     * Mostra uma seção e oculta as outras
     */
    mostrarSecao(nomeSecao) {
        // Atualizar nav links
        this.navLinks.forEach(link => {
            if (link.getAttribute('data-section') === nomeSecao) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Mostrar/ocultar seções
        this.contentSections.forEach(section => {
            if (section.id === nomeSecao) {
                section.classList.add('active');
                section.style.display = 'block';
            } else {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });

        // Carregar dados da seção
        switch (nomeSecao) {
            case 'dashboard':
                this.carregarDashboard();
                break;
            case 'perfil':
                this.carregarPerfil();
                break;
            case 'eventos':
                this.carregarEventos();
                break;
            case 'minhas-inscricoes':
                this.carregarMinhasInscricoes();
                break;
            case 'noticias':
                this.carregarNoticias();
                break;
            case 'galeria':
                this.carregarGaleria();
                break;
            case 'membros':
                this.carregarMembros();
                break;
            case 'notificacoes':
                this.carregarNotificacoes();
                break;
            case 'configuracoes':
                this.carregarConfiguracoes();
                break;
        }
    }

    /**
     * Carrega o Dashboard com estatísticas
     */
    async carregarDashboard() {
        try {
            // Carregar eventos próximos
            const eventos = await this._fetchData('php/api.php?endpoint=eventos') || [];
            this._preencherProximosEventos(eventos.slice(0, 3));

            // Carregar notícias
            const noticias = await this._fetchData('php/api.php?endpoint=noticias') || [];
            this._preencherUltimasNoticias(noticias.slice(0, 3));

            // Carregar minhas inscrições
            const inscricoes = await this._fetchData('php/api.php?endpoint=inscricoes_eventos&estudante=' + this.estudante.codigo) || [];
            this._preencherMinhasInscricoesDashboard(inscricoes.slice(0, 3));

            // Atualizar estatísticas
            this._atualizarEstatisticas(eventos.length, noticias.length, inscricoes.length);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            this._mostrarMensagemErro('Erro ao carregar dashboard', 'dashboard');
        }
    }

    /**
     * Faz requisição para a API
     */
    async _fetchData(url) {
        try {
            // Mapear chamadas ao antigo backend PHP para o cliente API quando possível
            if (url.includes('php/api.php')) {
                const parts = url.split('?');
                const qs = parts[1] || '';
                const params = Object.fromEntries(new URLSearchParams(qs));
                const endpoint = params.endpoint || '';

                switch (endpoint) {
                    case 'eventos':
                        if (params.id) return (await window.ucmAPI.getEvento(params.id)) || [];
                        return (await window.ucmAPI.getEventos()) || [];
                    case 'noticias':
                        return (await window.ucmAPI.getNoticias()) || [];
                    case 'membros':
                        return (await window.ucmAPI.getMembros()) || [];
                    case 'fotos':
                        return (await window.ucmAPI.getFotos()) || [];
                    case 'inscricoes_eventos':
                        const all = JSON.parse(localStorage.getItem('ucm_inscricoes') || '[]');
                        if (params.estudante) return all.filter(i => String(i.estudante_codigo) === String(params.estudante));
                        return all;
                    default:
                        return [];
                }
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro na requisição');
            const data = await response.json();
            return data.data || data || [];
        } catch (error) {
            console.error('Erro ao buscar dados:', url, error);
            return [];
        }
    }

    /**
     * Preenche a lista de próximos eventos no dashboard
     */
    _preencherProximosEventos(eventos) {
        const container = document.getElementById('upcomingEventsList');
        if (!container) return;

        if (eventos.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum evento próximo</p>';
            return;
        }

        container.innerHTML = eventos.map(evento => `
            <div class="event-item">
                <h5>${evento.nome}</h5>
                <p><i class="fas fa-calendar"></i> ${this._formatarData(evento.data_inicio)}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${evento.local}</p>
                <button class="btn btn-sm btn-primary" onclick="membrosManager.mostrarDetalhesEvento(${evento.id})">
                    Ver detalhes
                </button>
            </div>
        `).join('');
    }

    /**
     * Preenche a lista de últimas notícias no dashboard
     */
    _preencherUltimasNoticias(noticias) {
        const container = document.getElementById('latestNewsList');
        if (!container) return;

        if (noticias.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma notícia recente</p>';
            return;
        }

        container.innerHTML = noticias.map(noticia => `
            <div class="news-item">
                <h5>${noticia.titulo}</h5>
                <p>${noticia.conteudo.substring(0, 100)}...</p>
                <small><i class="fas fa-clock"></i> ${this._formatarData(noticia.data_criacao)}</small>
            </div>
        `).join('');
    }

    /**
     * Preenche minhas inscrições no dashboard
     */
    _preencherMinhasInscricoesDashboard(inscricoes) {
        const container = document.getElementById('myInscricoesList');
        if (!container) return;

        if (inscricoes.length === 0) {
            container.innerHTML = '<p class="empty-state">Você não se inscreveu em eventos ainda</p>';
            return;
        }

        container.innerHTML = inscricoes.map(insc => `
            <div class="inscricao-item">
                <h5>${insc.evento_nome}</h5>
                <p><i class="fas fa-calendar"></i> ${this._formatarData(insc.evento_data)}</p>
                <span class="status-badge status-${insc.status}">${insc.status}</span>
            </div>
        `).join('');
    }

    /**
     * Atualiza as estatísticas do dashboard
     */
    _atualizarEstatisticas(eventos, noticias, inscricoes) {
        const statMembros = document.getElementById('stat-membros');
        const statEventos = document.getElementById('stat-eventos');
        const statNoticias = document.getElementById('stat-noticias');
        const statFotos = document.getElementById('stat-fotos');

        if (statEventos) statEventos.textContent = eventos || '0';
        if (statNoticias) statNoticias.textContent = noticias || '0';

        // Carregar membros e fotos para completar estatísticas
        this._fetchData('php/api.php?endpoint=membros')
            .then(data => {
                if (statMembros) statMembros.textContent = (Array.isArray(data) ? data.length : 0) || '0';
            })
            .catch(e => console.error('Erro ao carregar membros:', e));

        this._fetchData('php/api.php?endpoint=fotos')
            .then(data => {
                if (statFotos) statFotos.textContent = (Array.isArray(data) ? data.length : 0) || '0';
            })
            .catch(e => console.error('Erro ao carregar fotos:', e));
    }

    /**
     * Carrega e exibe o perfil do usuário
     */
    async carregarPerfil() {
        try {
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileCampus = document.getElementById('profileCampus');

            if (profileName) profileName.textContent = this.estudante.nome || '-';
            if (profileEmail) profileEmail.textContent = this.estudante.email || '-';
            if (profileCampus) profileCampus.textContent = this.estudante.campus || '-';

            // Preencher todos os campos de perfil
            const campos = {
                'profNome': 'nome',
                'profCodigo': 'codigo',
                'profEmail': 'email',
                'profCampus2': 'campus',
                'profCurso': 'curso',
                'profAno': 'ano_estudo'
            };

            Object.entries(campos).forEach(([elementId, campoEstudante]) => {
                const el = document.getElementById(elementId);
                if (el) {
                    el.textContent = this.estudante[campoEstudante] || '-';
                }
            });
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            this._mostrarMensagemErro('Erro ao carregar perfil', 'perfil');
        }
    }

    /**
     * Carrega e exibe todos os eventos
     */
    async carregarEventos() {
        try {
            const eventos = await this._fetchData('php/api.php?endpoint=eventos');

            if (!Array.isArray(eventos)) {
                throw new Error('Resposta inválida do servidor');
            }

            this._preencherEventosContainer(eventos);
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            this._mostrarMensagemErro('Erro ao carregar eventos', 'eventos');
        }
    }

    /**
     * Preenche o container de eventos
     */
    _preencherEventosContainer(eventos) {
        const container = document.getElementById('eventsContainer');
        if (!container) return;

        if (eventos.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum evento disponível</p>';
            return;
        }

        container.innerHTML = eventos.map(evento => `
            <div class="event-card">
                <div class="event-header">
                    <h3>${evento.nome}</h3>
                    <span class="event-type-badge">${evento.tipo}</span>
                </div>
                <p class="event-description">${evento.descricao || 'Sem descrição'}</p>
                <div class="event-info">
                    <p><i class="fas fa-calendar"></i> ${this._formatarData(evento.data_inicio)}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${evento.local}</p>
                    <p><i class="fas fa-building"></i> ${evento.campus}</p>
                </div>
                <button class="btn btn-primary" onclick="membrosManager.mostrarDetalhesEvento(${evento.id})">
                    <i class="fas fa-info-circle"></i> Mais detalhes
                </button>
            </div>
        `).join('');
    }

    /**
     * Filtra eventos baseado em critérios
     */
    filtrarEventos() {
        const search = document.getElementById('eventSearch')?.value.toLowerCase() || '';
        const tipo = document.getElementById('eventTypeFilter')?.value || '';
        const campus = document.getElementById('campusFilter')?.value || '';

        const cards = document.querySelectorAll('.event-card');
        cards.forEach(card => {
            const titulo = card.querySelector('h3').textContent.toLowerCase();
            const tipoSpan = card.querySelector('.event-type-badge').textContent.toLowerCase();
            const campusText = card.textContent.toLowerCase();

            const matchesSearch = titulo.includes(search);
            const matchesTipo = !tipo || tipoSpan === tipo.toLowerCase();
            const matchesCampus = !campus || campusText.includes(campus.toLowerCase());

            card.style.display = (matchesSearch && matchesTipo && matchesCampus) ? '' : 'none';
        });
    }

    /**
     * Mostra detalhes de um evento em modal
     */
    async mostrarDetalhesEvento(eventoId) {
        try {
            const eventos = await this._fetchData(`php/api.php?endpoint=eventos&id=${eventoId}`);

            if (Array.isArray(eventos) && eventos.length > 0) {
                const ev = eventos[0];
                this._preencherModalEvento(ev);
                this.eventoAtualSelecionado = ev;
                this.abrirModal();
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do evento:', error);
            alert('Erro ao carregar detalhes do evento');
        }
    }

    /**
     * Preenche o modal com dados do evento
     */
    _preencherModalEvento(evento) {
        document.getElementById('modalEventoNome').textContent = evento.nome;
        document.getElementById('modalEventoDescricao').textContent = evento.descricao || 'Sem descrição';
        document.getElementById('modalEventoData').textContent = this._formatarData(evento.data_inicio);
        document.getElementById('modalEventoLocal').textContent = evento.local;
        document.getElementById('modalEventoCampus').textContent = evento.campus;
        document.getElementById('modalEventoTipo').textContent = evento.tipo;
    }

    /**
     * Abre o modal de evento
     */
    abrirModal() {
        if (this.modal) {
            this.modal.style.display = 'block';
        }
    }

    /**
     * Fecha o modal de evento
     */
    fecharModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    /**
     * Inscreve o usuário em um evento
     */
    async inscreverEmEvento() {
        if (!this.eventoAtualSelecionado) {
            alert('Erro: nenhum evento selecionado');
            return;
        }
        try {
            let result = null;

            if (window.ucmAPI && typeof window.ucmAPI.inscreverEvento === 'function') {
                try {
                    result = await window.ucmAPI.inscreverEvento(this.eventoAtualSelecionado.id, {
                        estudante_codigo: this.estudante.codigo
                    });
                } catch (apiErr) {
                    console.warn('Falha na chamada à API para inscrição:', apiErr);
                    result = null;
                }
            }

            // Fallback local quando a API não estiver disponível
            if (!result || !result.success) {
                const inscricoes = JSON.parse(localStorage.getItem('ucm_inscricoes') || '[]');
                const nova = {
                    id: Date.now(),
                    evento_id: this.eventoAtualSelecionado.id,
                    estudante_codigo: this.estudante.codigo,
                    evento_nome: this.eventoAtualSelecionado.nome || this.eventoAtualSelecionado.titulo || '',
                    evento_descricao: this.eventoAtualSelecionado.descricao || '',
                    evento_data: this.eventoAtualSelecionado.data_inicio || '',
                    evento_local: this.eventoAtualSelecionado.local || '',
                    status: 'confirmado',
                    criado_em: new Date().toISOString()
                };

                inscricoes.unshift(nova);
                localStorage.setItem('ucm_inscricoes', JSON.stringify(inscricoes));

                alert('Inscrição realizada em modo offline (salva localmente).');
                this.fecharModal();
                this.carregarMinhasInscricoes();
                return;
            }

            if (result && result.success) {
                alert('Inscrição realizada com sucesso!');
                this.fecharModal();
                this.carregarMinhasInscricoes();
            } else {
                alert('Erro ao inscrever: ' + (result && (result.message || result.error) ? (result.message || result.error) : 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro ao inscrever em evento:', error);
            alert('Erro ao processar inscrição');
        }
    }

    /**
     * Carrega minhas inscrições em eventos
     */
    async carregarMinhasInscricoes() {
        try {
            const inscricoes = await this._fetchData(`php/api.php?endpoint=inscricoes_eventos&estudante=${this.estudante.codigo}`);

            if (!Array.isArray(inscricoes)) {
                throw new Error('Resposta inválida do servidor');
            }

            this._preencherMinhasInscricoes(inscricoes);
        } catch (error) {
            console.error('Erro ao carregar inscrições:', error);
            this._mostrarMensagemErro('Erro ao carregar inscrições', 'minhas-inscricoes');
        }
    }

    /**
     * Preenche a lista de minhas inscrições
     */
    _preencherMinhasInscricoes(inscricoes) {
        const container = document.getElementById('minhasInscricoes');
        if (!container) return;

        if (inscricoes.length === 0) {
            container.innerHTML = '<p class="empty-state">Você não se inscreveu em nenhum evento ainda</p>';
            return;
        }

        container.innerHTML = inscricoes.map(insc => `
            <div class="inscricao-card">
                <h4>${insc.evento_nome}</h4>
                <p>${insc.evento_descricao}</p>
                <div class="inscricao-info">
                    <p><i class="fas fa-calendar"></i> ${this._formatarData(insc.evento_data)}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${insc.evento_local}</p>
                    <span class="status-badge status-${insc.status}">${insc.status}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Carrega notícias
     */
    async carregarNoticias() {
        try {
            const noticias = await this._fetchData('php/api.php?endpoint=noticias');

            if (!Array.isArray(noticias)) {
                throw new Error('Resposta inválida do servidor');
            }

            this._preencherNoticias(noticias);
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            this._mostrarMensagemErro('Erro ao carregar notícias', 'noticias');
        }
    }

    /**
     * Preenche a lista de notícias
     */
    _preencherNoticias(noticias) {
        const container = document.getElementById('newsContainer');
        if (!container) return;

        if (noticias.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma notícia disponível</p>';
            return;
        }

        container.innerHTML = noticias.map(noticia => `
            <div class="noticia-card">
                <h3>${noticia.titulo}</h3>
                <p class="noticia-categoria"><span class="categoria-badge">${noticia.categoria}</span></p>
                <p class="noticia-conteudo">${noticia.conteudo}</p>
                <div class="noticia-meta">
                    <small><i class="fas fa-calendar"></i> ${this._formatarData(noticia.data_criacao)}</small>
                    <small><i class="fas fa-eye"></i> ${noticia.visualizacoes} visualizações</small>
                </div>
            </div>
        `).join('');
    }

    /**
     * Carrega galeria de fotos
     */
    async carregarGaleria() {
        try {
            const fotos = await this._fetchData('php/api.php?endpoint=fotos');

            if (!Array.isArray(fotos)) {
                throw new Error('Resposta inválida do servidor');
            }

            this._preencherGaleria(fotos);
        } catch (error) {
            console.error('Erro ao carregar galeria:', error);
            this._mostrarMensagemErro('Erro ao carregar galeria', 'galeria');
        }
    }

    /**
     * Preenche a galeria de fotos
     */
    _preencherGaleria(fotos) {
        const container = document.getElementById('galleryContainer');
        if (!container) return;

        if (fotos.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma foto na galeria</p>';
            return;
        }

        container.innerHTML = fotos.map(foto => `
            <div class="gallery-item">
                <img src="${foto.caminho_arquivo}" alt="${foto.descricao}" loading="lazy">
                <div class="gallery-overlay">
                    <h4>${foto.descricao}</h4>
                    <small>${foto.album || 'Geral'}</small>
                </div>
            </div>
        `).join('');
    }

    /**
     * Carrega lista de membros
     */
    async carregarMembros() {
        try {
            const membros = await this._fetchData('php/api.php?endpoint=membros');

            if (!Array.isArray(membros)) {
                throw new Error('Resposta inválida do servidor');
            }

            this._preencherMembros(membros);
        } catch (error) {
            console.error('Erro ao carregar membros:', error);
            this._mostrarMensagemErro('Erro ao carregar membros', 'membros');
        }
    }

    /**
     * Preenche a lista de membros
     */
    _preencherMembros(membros) {
        const container = document.getElementById('membrosList');
        if (!container) return;

        if (membros.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum membro disponível</p>';
            return;
        }

        container.innerHTML = membros.map(membro => `
            <div class="membro-card">
                <div class="membro-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="membro-info">
                    <h4>${membro.nome}</h4>
                    <p>${membro.campus}</p>
                    <p class="membro-email">${membro.email}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Carrega notificações
     */
    async carregarNotificacoes() {
        const container = document.getElementById('notificacoesContainer');
        if (!container) return;

        // Por enquanto, mostrar mensagem vazia
        container.innerHTML = '<p class="empty-state">Nenhuma notificação no momento</p>';
    }

    /**
     * Carrega configurações
     */
    carregarConfiguracoes() {
        // Configurações já estão no HTML
        // Aqui você poderia carregar preferências do servidor
    }

    /**
     * Mostra formulário de edição de perfil
     */
    mostrarFormularioEditarPerfil() {
        alert('Funcionalidade de edição de perfil em desenvolvimento');
    }

    /**
     * Mostra formulário de alteração de senha
     */
    mostrarFormularioAlterarSenha() {
        alert('Funcionalidade de alteração de senha em desenvolvimento');
    }

    /**
     * Formata data para formato legível
     */
    _formatarData(data) {
        if (!data) return '-';
        try {
            const d = new Date(data);
            return d.toLocaleDateString('pt-MZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return data;
        }
    }

    /**
     * Mostra mensagem de erro em uma seção
     */
    _mostrarMensagemErro(mensagem, secaoId) {
        const secao = document.getElementById(secaoId);
        if (secao) {
            const mainContent = secao.querySelector('.events-container, .inscricoes-container, .news-container, .gallery-container, .membros-list, .notificacoes-container, .profile-content');
            if (mainContent) {
                mainContent.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-circle"></i> ${mensagem}</div>`;
            }
        }
    }

    /**
     * Faz logout do utilizador
     */
    fazerLogout() {
        localStorage.removeItem('ucm_token');
        localStorage.removeItem('ucm_estudante');
        localStorage.removeItem('ucm_remember');
        localStorage.removeItem('ucm_email_remember');
        window.location.href = 'index.html';
    }
}

// Inicializa o MembrosManager quando o DOM está pronto
let membrosManager;
document.addEventListener('DOMContentLoaded', () => {
    membrosManager = new MembrosManager();
});
