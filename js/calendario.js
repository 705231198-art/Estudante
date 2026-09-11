/**
 * CALENDÁRIO DE EVENTOS - Núcleo dos Estudantes UCM
 * Responsável pelo calendário interativo de eventos
 */

class CalendarioManager {
    constructor() {
        this.calendar = null;
        this.eventos = [];
        this.filtrosAtivos = {
            academico: true,
            cultural: true,
            desportivo: true,
            social: true
        };
        this.eventoAtual = null;
        
        this.init();
    }
    
    init() {
        console.log('📅 Calendário Manager inicializado');
        
        // Carregar eventos
        this.carregarEventos();
        
        // Inicializar calendário FullCalendar
        this.inicializarCalendario();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar próximos eventos na sidebar
        this.carregarProximosEventos();
    }
    
    carregarEventos() {
        // Eventos de exemplo - em produção viriam de uma API
        this.eventos = [
            {
                id: 1,
                title: 'Palestra: Empreendedorismo Digital',
                start: this.getDateString(0, 14, 0), // Hoje às 14:00
                end: this.getDateString(0, 16, 0),
                tipo: 'academico',
                descricao: 'Palestra sobre oportunidades no empreendedorismo digital com convidados especiais do mercado.',
                local: 'Auditório Principal',
                organizacao: 'Núcleo UCM - Comissão Acadêmica',
                color: '#4CAF50',
                textColor: 'white',
                campus: 'Maputo',
                inscricoesAbertas: true,
                vagas: 50
            },
            {
                id: 2,
                title: 'Torneio de Futebol Inter-faculdades',
                start: this.getDateString(2, 9, 0), // Daqui 2 dias às 9:00
                end: this.getDateString(2, 17, 0),
                tipo: 'desportivo',
                descricao: 'Grande torneio de futebol entre faculdades da UCM. Premiação para os vencedores.',
                local: 'Campo Desportivo',
                organizacao: 'Comissão Desportiva',
                color: '#FF9800',
                textColor: 'white',
                campus: 'Todos',
                inscricoesAbertas: true,
                vagas: 100
            },
            {
                id: 3,
                title: 'Noite Cultural UCM',
                start: this.getDateString(5, 18, 0), // Daqui 5 dias às 18:00
                end: this.getDateString(5, 23, 0),
                tipo: 'cultural',
                descricao: 'Celebração da diversidade cultural moçambicana com música, dança e gastronomia tradicional.',
                local: 'Pátio Central',
                organizacao: 'Comissão Cultural',
                color: '#2196F3',
                textColor: 'white',
                campus: 'Maputo',
                inscricoesAbertas: true,
                vagas: 200
            },
            {
                id: 4,
                title: 'Workshop: Preparação para o Mercado',
                start: this.getDateString(7, 10, 0), // Daqui 7 dias às 10:00
                end: this.getDateString(7, 13, 0),
                tipo: 'academico',
                descricao: 'Workshop sobre criação de currículo, entrevistas de emprego e desenvolvimento profissional.',
                local: 'Sala 205',
                organizacao: 'Núcleo UCM',
                color: '#4CAF50',
                textColor: 'white',
                campus: 'Beira',
                inscricoesAbertas: true,
                vagas: 30
            },
            {
                id: 5,
                title: 'Campanha Solidária',
                start: this.getDateString(10, 8, 0), // Daqui 10 dias às 8:00
                end: this.getDateString(10, 16, 0),
                tipo: 'social',
                descricao: 'Arrecadação de alimentos e roupas para comunidades carenciadas da região.',
                local: 'Entrada Principal',
                organizacao: 'Comissão Social',
                color: '#9C27B0',
                textColor: 'white',
                campus: 'Todos',
                inscricoesAbertas: true,
                vagas: null // Sem limite de vagas
            },
            {
                id: 6,
                title: 'Visita Técnica à Empresa X',
                start: this.getDateString(14, 8, 30), // Daqui 14 dias às 8:30
                end: this.getDateString(14, 12, 0),
                tipo: 'academico',
                descricao: 'Visita técnica para conhecer os processos internos de uma grande empresa nacional.',
                local: 'Empresa X',
                organizacao: 'Comissão Acadêmica',
                color: '#4CAF50',
                textColor: 'white',
                campus: 'Nampula',
                inscricoesAbertas: true,
                vagas: 25
            }
        ];
    }
    
    getDateString(daysFromNow, hours, minutes) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        date.setHours(hours, minutes, 0, 0);
        return date.toISOString().slice(0, 16); // Formato: YYYY-MM-DDTHH:MM
    }
    
    inicializarCalendario() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            headerToolbar: false, // Usamos nossos próprios controles
            events: this.getEventosFiltrados(),
            eventClick: (info) => this.abrirDetalhesEvento(info.event),
            datesSet: (info) => this.atualizarMesAtual(info.view.currentStart),
            eventDidMount: (info) => {
                // Adicionar tooltip
                if (info.event.extendedProps.descricao) {
                    info.el.title = info.event.extendedProps.descricao;
                }
                
                // Adicionar classe CSS baseada no tipo
                const tipo = info.event.extendedProps.tipo;
                if (tipo) {
                    info.el.classList.add(tipo);
                }
            },
            eventContent: (info) => {
                // Personalizar conteúdo do evento
                const tipo = info.event.extendedProps.tipo;
                const tipoIcon = this.getTipoIcone(tipo);
                
                return {
                    html: `
                        <div class="fc-event-content">
                            <i class="fas fa-${tipoIcon}"></i>
                            <span class="fc-event-title">${info.event.title}</span>
                        </div>
                    `
                };
            },
            height: 'auto',
            contentHeight: 500,
            dayMaxEvents: 3,
            weekends: true,
            firstDay: 1, // Segunda-feira
            buttonText: {
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                list: 'Lista'
            }
        });
        
        this.calendar.render();
        this.atualizarMesAtual(this.calendar.view.currentStart);
    }
    
    getEventosFiltrados() {
        return this.eventos.filter(evento => this.filtrosAtivos[evento.tipo]);
    }
    
    setupEventListeners() {
        // Filtros
        document.querySelectorAll('.filtro-option input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const tipo = e.target.dataset.tipo;
                this.filtrosAtivos[tipo] = e.target.checked;
                this.atualizarCalendario();
            });
        });
        
        // Controles do calendário
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.calendar.prev();
        });
        
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.calendar.next();
        });
        
        document.getElementById('todayBtn')?.addEventListener('click', () => {
            this.calendar.today();
        });
        
        // Mudar visualização
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const view = e.target.dataset.view;
                this.calendar.changeView(`dayGrid${view.charAt(0).toUpperCase() + view.slice(1)}`);
            });
        });
        
        // Modal
        document.getElementById('modalClose')?.addEventListener('click', () => {
            this.fecharModal();
        });
        
        // Sugerir evento
        const sugerirForm = document.getElementById('sugerirEventoForm');
        if (sugerirForm) {
            sugerirForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sugerirEvento();
            });
            
            // Preencher data atual
            document.getElementById('eventoData').value = new Date().toISOString().split('T')[0];
        }
        
        // Adicionar ao Google Calendar
        document.getElementById('exportGoogleCalendar')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.eventoAtual) {
                this.adicionarAoGoogleCalendar();
            } else {
                this.mostrarCalendarioGeral();
            }
        });
        
        // Inscrever no evento
        document.getElementById('inscreverBtn')?.addEventListener('click', () => {
            this.inscreverNoEvento();
        });
    }
    
    atualizarCalendario() {
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(this.getEventosFiltrados());
        this.carregarProximosEventos();
    }
    
    atualizarMesAtual(date) {
        const mesAtual = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const mesAtualElement = document.getElementById('currentMonth');
        if (mesAtualElement) {
            mesAtualElement.textContent = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);
        }
    }
    
    carregarProximosEventos() {
        const container = document.getElementById('proximosEventosList');
        if (!container) return;
        
        const agora = new Date();
        const proximos = this.getEventosFiltrados()
            .filter(evento => new Date(evento.start) > agora)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5);
        
        container.innerHTML = '';
        
        if (proximos.length === 0) {
            container.innerHTML = '<p class="sem-eventos">Nenhum evento próximo</p>';
            return;
        }
        
        proximos.forEach(evento => {
            const div = document.createElement('div');
            div.className = 'evento-sidebar-item';
            div.dataset.id = evento.id;
            
            const data = new Date(evento.start);
            const dataFormatada = data.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short'
            });
            
            const horaFormatada = data.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            div.innerHTML = `
                <h4>${evento.title}</h4>
                <div class="evento-sidebar-meta">
                    <span><i class="far fa-calendar"></i> ${dataFormatada}</span>
                    <span><i class="far fa-clock"></i> ${horaFormatada}</span>
                </div>
            `;
            
            div.addEventListener('click', () => {
                this.abrirDetalhesEvento({ event: { extendedProps: evento, title: evento.title } });
            });
            
            container.appendChild(div);
        });
    }
    
    abrirDetalhesEvento(event) {
        const props = event.event.extendedProps;
        this.eventoAtual = props;
        this.eventoAtual.title = event.event.title;
        this.eventoAtual.start = props.start;
        this.eventoAtual.end = props.end;
        
        // Preencher modal
        document.getElementById('modalTitulo').textContent = event.event.title;
        document.getElementById('modalCategoria').textContent = this.getTipoNome(props.tipo);
        document.getElementById('modalCategoria').style.background = props.color || '#3498db';
        
        const dataInicio = new Date(props.start);
        const dataFim = props.end ? new Date(props.end) : null;
        
        // Formatar data
        let dataTexto = dataInicio.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        document.getElementById('modalData').textContent = dataTexto;
        
        // Formatar horário
        if (props.start.includes('T')) {
            const horaInicio = dataInicio.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            let horaTexto = horaInicio;
            if (dataFim) {
                const horaFim = dataFim.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                horaTexto += ` - ${horaFim}`;
            }
            
            document.getElementById('modalHorario').textContent = horaTexto;
        }
        
        document.getElementById('modalLocal').textContent = props.local || 'A definir';
        document.getElementById('modalDescricao').textContent = props.descricao || 'Sem descrição detalhada.';
        
        // Mostrar informações adicionais
        let infoExtra = '';
        if (props.organizacao) {
            infoExtra += `<div class="info-item"><i class="fas fa-users"></i><div><strong>Organização:</strong> <span>${props.organizacao}</span></div></div>`;
        }
        if (props.campus) {
            infoExtra += `<div class="info-item"><i class="fas fa-university"></i><div><strong>Campus:</strong> <span>${props.campus}</span></div></div>`;
        }
        if (props.vagas) {
            infoExtra += `<div class="info-item"><i class="fas fa-user-friends"></i><div><strong>Vagas:</strong> <span>${props.vagas}</span></div></div>`;
        }
        
        const infoContainer = document.querySelector('.evento-info');
        if (infoContainer && infoExtra) {
            infoContainer.insertAdjacentHTML('beforeend', infoExtra);
        }
        
        // Configurar botão de inscrição
        const inscreverBtn = document.getElementById('inscreverBtn');
        if (inscreverBtn) {
            if (props.inscricoesAbertas) {
                inscreverBtn.innerHTML = '<i class="fas fa-user-plus"></i> Inscrever-me';
                inscreverBtn.disabled = false;
                inscreverBtn.onclick = () => this.inscreverNoEvento();
            } else {
                inscreverBtn.innerHTML = '<i class="fas fa-ban"></i> Inscrições Encerradas';
                inscreverBtn.disabled = true;
            }
        }
        
        // Mostrar modal
        document.getElementById('eventoModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    fecharModal() {
        document.getElementById('eventoModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Limpar informações extras
        const infoContainer = document.querySelector('.evento-info');
        if (infoContainer) {
            const items = infoContainer.querySelectorAll('.info-item');
            if (items.length > 3) { // Mantém apenas os 3 primeiros
                for (let i = 3; i < items.length; i++) {
                    items[i].remove();
                }
            }
        }
        
        this.eventoAtual = null;
    }
    
    sugerirEvento() {
        const form = document.getElementById('sugerirEventoForm');
        const dados = {
            titulo: document.getElementById('eventoTitulo').value,
            tipo: document.getElementById('eventoTipo').value,
            data: document.getElementById('eventoData').value,
            hora: document.getElementById('eventoHora').value,
            descricao: document.getElementById('eventoDescricao').value
        };
        
        // Validação
        if (!dados.titulo || !dados.tipo || !dados.data) {
            this.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        // Em produção, enviaria para o backend
        console.log('Evento sugerido:', dados);
        
        this.mostrarNotificacao('Evento sugerido com sucesso! A direção analisará sua sugestão.', 'success');
        form.reset();
        
        // Resetar data para hoje
        document.getElementById('eventoData').value = new Date().toISOString().split('T')[0];
    }
    
    adicionarAoGoogleCalendar() {
        if (!this.eventoAtual) return;
        
        const startDate = new Date(this.eventoAtual.start);
        const endDate = this.eventoAtual.end ? new Date(this.eventoAtual.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        
        // Formatar datas para Google Calendar
        const formatDate = (date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, '');
        };
        
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${encodeURIComponent(this.eventoAtual.title)}` +
            `&dates=${formatDate(startDate)}/${formatDate(endDate)}` +
            `&details=${encodeURIComponent(this.eventoAtual.descricao || '')}` +
            `&location=${encodeURIComponent(this.eventoAtual.local || '')}` +
            `&sf=true&output=xml`;
        
        window.open(googleCalendarUrl, '_blank');
    }
    
    mostrarCalendarioGeral() {
        // URL para adicionar todos os eventos ao Google Calendar (formato iCal)
        const icalUrl = 'calendario.ics'; // Em produção, geraria este arquivo dinamicamente
        window.open(icalUrl, '_blank');
    }
    
    inscreverNoEvento() {
        if (!this.eventoAtual) return;
        
        // Em produção, redirecionaria para formulário de inscrição
        const mensagem = `Inscrição para "${this.eventoAtual.title}"\n\n` +
                        `Local: ${this.eventoAtual.local}\n` +
                        `Data: ${new Date(this.eventoAtual.start).toLocaleDateString('pt-BR')}\n\n` +
                        'Em breve teremos um sistema de inscrições online!';
        
        alert(mensagem);
    }
    
    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================
    
    getTipoNome(tipo) {
        const tipos = {
            'academico': 'Acadêmico',
            'cultural': 'Cultural',
            'desportivo': 'Desportivo',
            'social': 'Social'
        };
        return tipos[tipo] || tipo;
    }
    
    getTipoIcone(tipo) {
        const icones = {
            'academico': 'graduation-cap',
            'cultural': 'music',
            'desportivo': 'futbol',
            'social': 'hands-helping'
        };
        return icones[tipo] || 'calendar-alt';
    }
    
    mostrarNotificacao(mensagem, tipo = 'info') {
        if (window.ucmSite && typeof window.ucmSite.showNotification === 'function') {
            window.ucmSite.showNotification(mensagem, tipo);
        } else {
            alert(mensagem);
        }
    }
    
    // ==========================================================================
    // FUNÇÕES DE ADMINISTRAÇÃO
    // ==========================================================================
    
    adicionarEvento(evento) {
        // Validar evento
        if (!evento.title || !evento.start) {
            throw new Error('Título e data de início são obrigatórios');
        }
        
        // Gerar ID único
        evento.id = this.eventos.length > 0 ? Math.max(...this.eventos.map(e => e.id)) + 1 : 1;
        
        // Adicionar ao array
        this.eventos.push(evento);
        
        // Atualizar calendário
        this.atualizarCalendario();
        
        // Retornar evento criado
        return evento;
    }
    
    editarEvento(id, dadosAtualizados) {
        const index = this.eventos.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error('Evento não encontrado');
        }
        
        // Atualizar evento
        this.eventos[index] = { ...this.eventos[index], ...dadosAtualizados };
        
        // Atualizar calendário
        this.atualizarCalendario();
        
        return this.eventos[index];
    }
    
    removerEvento(id) {
        const index = this.eventos.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error('Evento não encontrado');
        }
        
        // Remover evento
        const eventoRemovido = this.eventos.splice(index, 1)[0];
        
        // Atualizar calendário
        this.atualizarCalendario();
        
        return eventoRemovido;
    }
    
    // ==========================================================================
    // EXPORTAÇÃO E IMPORTACAÇÃO
    // ==========================================================================
    
    exportarEventos() {
        const dados = {
            exportadoEm: new Date().toISOString(),
            totalEventos: this.eventos.length,
            eventos: this.eventos
        };
        
        // Criar arquivo JSON para download
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eventos-ucm-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    importarEventos(jsonString) {
        try {
            const dados = JSON.parse(jsonString);
            
            if (!Array.isArray(dados.eventos)) {
                throw new Error('Formato de importação inválido');
            }
            
            // Adicionar novos eventos
            dados.eventos.forEach(evento => {
                if (!this.eventos.some(e => e.id === evento.id)) {
                    this.eventos.push(evento);
                }
            });
            
            // Atualizar calendário
            this.atualizarCalendario();
            
            return {
                success: true,
                totalImportados: dados.eventos.length,
                totalAgora: this.eventos.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Inicializar calendário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendar')) {
        window.calendarioManager = new CalendarioManager();
    }
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CalendarioManager };
}