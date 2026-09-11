/**
 * GALERIA DE FOTOS - Núcleo dos Estudantes UCM
 * Responsável pela galeria interativa de fotos
 */

class GaleriaManager {
    constructor() {
        this.fotos = [];
        this.fotosCarregadas = 0;
        this.fotosPorVez = 9;
        this.categoriaAtual = 'todos';
        this.fotoAtual = null;
        this.fotoIndex = 0;
        
        this.init();
    }
    
    init() {
        console.log('📸 Galeria Manager inicializado');
        this.carregarFotos();
        this.setupEventListeners();
        this.setupLightbox();
        this.renderizarGaleria();
    }
    
    carregarFotos() {
        // Fotos de exemplo - em produção viriam de uma API ou banco de dados
        this.fotos = [
            {
                id: 1,
                src: 'images/placeholders/galeria1.jpg',
                titulo: 'Semana Acadêmica 2024',
                descricao: 'Palestras e workshops durante a semana acadêmica anual da UCM',
                categoria: 'academicos',
                data: '15 Out 2024',
                destaque: true,
                campus: 'Maputo'
            },
            {
                id: 2,
                src: 'images/placeholders/galeria2.jpg',
                titulo: 'Torneio de Futebol Inter-faculdades',
                descricao: 'Grande torneio de futebol entre faculdades da UCM',
                categoria: 'desportivos',
                data: '18 Out 2024',
                destaque: true,
                campus: 'Beira'
            },
            {
                id: 3,
                src: 'images/placeholders/galeria3.jpg',
                titulo: 'Noite Cultural UCM',
                descricao: 'Celebração da diversidade cultural moçambicana',
                categoria: 'culturais',
                data: '25 Out 2024',
                destaque: true,
                campus: 'Nampula'
            },
            {
                id: 4,
                src: 'images/placeholders/galeria4.jpg',
                titulo: 'Workshop: Empreendedorismo Digital',
                descricao: 'Workshop sobre oportunidades no empreendedorismo digital',
                categoria: 'academicos',
                data: '10 Nov 2024',
                campus: 'Quelimane'
            },
            {
                id: 5,
                src: 'images/placeholders/galeria5.jpg',
                titulo: 'Campanha Solidária',
                descricao: 'Arrecadação de alimentos para comunidades carenciadas',
                categoria: 'social',
                data: '5 Dez 2024',
                campus: 'Pemba'
            },
            {
                id: 6,
                src: 'images/placeholders/galeria6.jpg',
                titulo: 'Feira de Carreiras',
                descricao: 'Feira de oportunidades profissionais para estudantes',
                categoria: 'academicos',
                data: '20 Nov 2024',
                campus: 'Maputo'
            },
            {
                id: 7,
                src: 'images/placeholders/galeria7.jpg',
                titulo: 'Visita Técnica',
                descricao: 'Visita técnica a empresa parceira',
                categoria: 'academicos',
                data: '15 Dez 2024',
                campus: 'Beira'
            },
            {
                id: 8,
                src: 'images/placeholders/galeria8.jpg',
                titulo: 'Dia do Desporto',
                descricao: 'Dia dedicado a atividades desportivas',
                categoria: 'desportivos',
                data: '8 Nov 2024',
                campus: 'Nampula'
            },
            {
                id: 9,
                src: 'images/placeholders/galeria9.jpg',
                titulo: 'Exposição de Arte',
                descricao: 'Exposição de trabalhos artísticos dos estudantes',
                categoria: 'culturais',
                data: '30 Nov 2024',
                campus: 'Quelimane'
            }
        ];
    }
    
    setupEventListeners() {
        // Filtros de categoria
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.categoriaAtual = e.target.dataset.categoria;
                this.fotosCarregadas = this.fotosPorVez;
                this.renderizarGaleria();
            });
        });
        
        // Botão "Carregar Mais"
        const carregarMaisBtn = document.getElementById('carregarMaisBtn');
        if (carregarMaisBtn) {
            carregarMaisBtn.addEventListener('click', () => {
                this.fotosCarregadas += this.fotosPorVez;
                this.renderizarGaleria();
                this.atualizarBotaoCarregarMais();
            });
        }
        
        // Fechar lightbox com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.fecharLightbox();
        });
    }
    
    setupLightbox() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.lightboxTitle = document.getElementById('lightboxTitle');
        this.lightboxDescription = document.getElementById('lightboxDescription');
        this.lightboxDate = document.getElementById('lightboxDate');
        this.lightboxCategoria = document.getElementById('lightboxCategoria');
        
        // Botões do lightbox
        document.getElementById('lightboxClose')?.addEventListener('click', () => this.fecharLightbox());
        document.getElementById('lightboxPrev')?.addEventListener('click', () => this.navegarLightbox(-1));
        document.getElementById('lightboxNext')?.addEventListener('click', () => this.navegarLightbox(1));
        
        // Teclas de navegação
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox?.classList.contains('active')) return;
            
            if (e.key === 'ArrowLeft') this.navegarLightbox(-1);
            if (e.key === 'ArrowRight') this.navegarLightbox(1);
        });
    }
    
    renderizarGaleria() {
        const grid = document.getElementById('galeriaGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const fotosFiltradas = this.getFotosFiltradas();
        const fotosParaMostrar = fotosFiltradas.slice(0, this.fotosCarregadas);
        
        if (fotosParaMostrar.length === 0) {
            this.mostrarEstadoVazio();
            return;
        }
        
        fotosParaMostrar.forEach((foto, index) => {
            const fotoElement = this.criarElementoFoto(foto, index);
            grid.appendChild(fotoElement);
        });
        
        this.atualizarBotaoCarregarMais();
    }
    
    getFotosFiltradas() {
        return this.categoriaAtual === 'todos' 
            ? this.fotos 
            : this.fotos.filter(foto => foto.categoria === this.categoriaAtual);
    }
    
    criarElementoFoto(foto, index) {
        const div = document.createElement('div');
        div.className = 'foto-item';
        div.dataset.id = foto.id;
        div.dataset.index = index;
        
        div.innerHTML = `
            <div class="foto-categoria">${this.getCategoriaNome(foto.categoria)}</div>
            <img src="${foto.src}" alt="${foto.titulo}" class="foto-imagem" loading="lazy">
            <div class="foto-overlay">
                <h4>${foto.titulo}</h4>
                <p>${foto.data} • ${foto.campus || 'UCM'}</p>
            </div>
        `;
        
        div.addEventListener('click', () => this.abrirLightbox(foto, index));
        return div;
    }
    
    mostrarEstadoVazio() {
        const grid = document.getElementById('galeriaGrid');
        if (!grid) return;
        
        grid.innerHTML = `
            <div class="galeria-empty">
                <i class="fas fa-images"></i>
                <h3>Nenhuma foto encontrada</h3>
                <p>Não há fotos na categoria selecionada.</p>
                <button class="btn btn-primary" id="resetFilters">
                    <i class="fas fa-filter"></i> Mostrar Todas as Categorias
                </button>
            </div>
        `;
        
        document.getElementById('resetFilters')?.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.filtro-btn[data-categoria="todos"]')?.classList.add('active');
            this.categoriaAtual = 'todos';
            this.fotosCarregadas = this.fotosPorVez;
            this.renderizarGaleria();
        });
    }
    
    atualizarBotaoCarregarMais() {
        const container = document.getElementById('carregarMaisContainer');
        const btn = document.getElementById('carregarMaisBtn');
        const fotosFiltradas = this.getFotosFiltradas();
        
        if (!container || !btn) return;
        
        if (this.fotosCarregadas >= fotosFiltradas.length) {
            container.style.display = 'none';
        } else {
            container.style.display = 'block';
            const restantes = fotosFiltradas.length - this.fotosCarregadas;
            btn.innerHTML = `<i class="fas fa-plus"></i> Carregar Mais (${restantes} restantes)`;
        }
    }
    
    // ==========================================================================
    // LIGHTBOX
    // ==========================================================================
    
    abrirLightbox(foto, index) {
        this.fotoAtual = foto;
        this.fotoIndex = index;
        
        // Atualizar conteúdo do lightbox
        this.lightboxImage.src = foto.src;
        this.lightboxTitle.textContent = foto.titulo;
        this.lightboxDescription.textContent = foto.descricao;
        this.lightboxDate.textContent = foto.data;
        this.lightboxCategoria.textContent = this.getCategoriaNome(foto.categoria);
        
        // Mostrar campus se disponível
        if (foto.campus) {
            this.lightboxCategoria.innerHTML += ` • ${foto.campus}`;
        }
        
        // Mostrar lightbox
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Atualizar navegação
        this.atualizarNavegacaoLightbox();
    }
    
    fecharLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.fotoAtual = null;
        this.fotoIndex = 0;
    }
    
    navegarLightbox(direcao) {
        const fotosFiltradas = this.getFotosFiltradas();
        if (fotosFiltradas.length <= 1) return;
        
        let novoIndex = this.fotoIndex + direcao;
        
        // Circular navigation
        if (novoIndex < 0) novoIndex = fotosFiltradas.length - 1;
        if (novoIndex >= fotosFiltradas.length) novoIndex = 0;
        
        this.abrirLightbox(fotosFiltradas[novoIndex], novoIndex);
    }
    
    atualizarNavegacaoLightbox() {
        const fotosFiltradas = this.getFotosFiltradas();
        const prevBtn = document.getElementById('lightboxPrev');
        const nextBtn = document.getElementById('lightboxNext');
        
        if (prevBtn) prevBtn.style.display = fotosFiltradas.length > 1 ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = fotosFiltradas.length > 1 ? 'flex' : 'none';
    }
    
    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================
    
    getCategoriaNome(categoria) {
        const categorias = {
            'todos': 'Todas',
            'eventos': 'Eventos',
            'culturais': 'Culturais',
            'desportivos': 'Desportivos',
            'academicos': 'Acadêmicos',
            'social': 'Social'
        };
        return categorias[categoria] || categoria;
    }
    
    // ==========================================================================
    // UPLOAD DE FOTOS (para admin)
    // ==========================================================================
    
    async uploadFoto(file) {
        // Em produção, implementar upload para servidor
        console.log('Upload de foto:', file.name);
        
        // Simular upload
        return new Promise((resolve) => {
            setTimeout(() => {
                const novaFoto = {
                    id: this.fotos.length + 1,
                    src: URL.createObjectURL(file),
                    titulo: file.name.replace(/\.[^/.]+$/, ""),
                    descricao: 'Foto enviada recentemente',
                    categoria: 'eventos',
                    data: new Date().toLocaleDateString('pt-BR'),
                    destaque: false
                };
                
                this.fotos.unshift(novaFoto);
                this.renderizarGaleria();
                resolve(novaFoto);
            }, 1000);
        });
    }
    
    // ==========================================================================
    // DESTAQUES
    // ==========================================================================
    
    alternarDestaque(fotoId) {
        const foto = this.fotos.find(f => f.id === fotoId);
        if (foto) {
            foto.destaque = !foto.destaque;
            this.renderizarGaleria();
            return foto.destaque;
        }
        return false;
    }
    
    // ==========================================================================
    // EXPORTAÇÃO
    // ==========================================================================
    
    exportarGaleria() {
        const fotosParaExportar = this.getFotosFiltradas();
        const dados = {
            categoria: this.categoriaAtual,
            totalFotos: fotosParaExportar.length,
            fotos: fotosParaExportar.map(foto => ({
                titulo: foto.titulo,
                categoria: foto.categoria,
                data: foto.data,
                campus: foto.campus
            }))
        };
        
        // Criar arquivo JSON para download
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `galeria-ucm-${this.categoriaAtual}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Galeria exportada:', dados);
    }
}

// Inicializar galeria quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('galeriaGrid')) {
        window.galeriaManager = new GaleriaManager();
    }
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GaleriaManager };
}