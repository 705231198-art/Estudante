/**
 * SCRIPT PRINCIPAL - Núcleo dos Estudantes UCM
 * Responsável pelas funcionalidades gerais do site
 * Autor: Núcleo UCM
 * Data: 2024
 */

class UCMSite {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.init();
    }

    init() {
        console.log('🚀 Site do Núcleo UCM iniciado');
        
        // Inicializar componentes
        this.initMobileMenu();
        this.initSmoothScrolling();
        this.initCurrentYear();
        this.initContactForm();
        this.initNewsLoader();
        this.initScrollEffects();
        this.initAnimations();
        
        // Verificar se é página de admin
        if (window.location.pathname.includes('admin.html') || 
            window.location.pathname.includes('area-membros.html')) {
            this.checkAuth();
        }
    }

    // ==========================================================================
    // NAVEGAÇÃO E MENU
    // ==========================================================================

    initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');

        if (!menuToggle || !navLinks) return;

        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Fechar menu ao clicar em um link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (menuToggle) {
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (menuToggle && navLinks) {
                if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    initSmoothScrolling() {
        // Scroll suave para âncoras
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Atualizar link ativo baseado na scroll position
        window.addEventListener('scroll', () => {
            this.updateActiveNavLink();
        });
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        
        let currentSection = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // ==========================================================================
    // FORMULÁRIOS
    // ==========================================================================

    initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Mostrar loading
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            // Coletar dados do formulário
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            try {
                let result = null;

                // Tentar usar client-side fallback se disponível
                if (window.ucmAPI && typeof window.ucmAPI.enviarEmailContato === 'function') {
                    try {
                        result = await window.ucmAPI.enviarEmailContato(data);
                    } catch (e) {
                        console.warn('ucmAPI enviarEmailContato falhou, tentando fetch fallback', e);
                        result = null;
                    }
                }

                // Se não obteve resultado via cliente, tentar enviar para endpoint (pode não existir)
                if (!result) {
                    try {
                        const response = await fetch('php/send-email.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        });
                        result = await response.json();
                    } catch (fetchErr) {
                        console.warn('Fetch send-email falhou, usando fallback local', fetchErr);
                        result = await window.ucmAPI.enviarEmailContato ? await window.ucmAPI.enviarEmailContato(data) : null;
                    }
                }

                // Mostrar mensagem
                this.showFormMessage(
                    result && result.success ? 'success' : 'error',
                    result && result.message ? result.message : 'Mensagem salva localmente.'
                );

                // Limpar formulário se sucesso
                if (result && result.success) {
                    contactForm.reset();
                }
            } catch (error) {
                console.error('Erro ao enviar formulário:', error);
                this.showFormMessage('error', 'Erro de conexão com o servidor. Tente novamente mais tarde.');
            } finally {
                // Restaurar botão
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    showFormMessage(type, message) {
        const formMessage = document.getElementById('formMessage');
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.className = '';
        formMessage.classList.add(type);
        formMessage.style.display = 'block';

        // Esconder mensagem após 5 segundos
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }

    // ==========================================================================
    // NOTÍCIAS
    // ==========================================================================

    initNewsLoader() {
        const newsContainer = document.getElementById('newsContainer');
        const loadMoreBtn = document.getElementById('loadMoreNews');
        
        if (!newsContainer) return;

        // Notícias de exemplo
        const news = [
            {
                id: 1,
                title: "Semana Acadêmica 2024",
                excerpt: "A maior semana académica do ano acontecerá em Outubro com palestras e workshops.",
                date: "15 Set 2024",
                image: "images/placeholders/noticia1.jpg",
                category: "Académico"
            },
            {
                id: 2,
                title: "Torneio Inter-faculdades",
                excerpt: "Participe do maior torneio desportivo da UCM com futebol e basquetebol.",
                date: "10 Set 2024",
                image: "images/placeholders/noticia2.jpg",
                category: "Desporto"
            },
            {
                id: 3,
                title: "Campanha Solidária",
                excerpt: "Arrecadação de alimentos e roupas para comunidades carenciadas.",
                date: "5 Set 2024",
                image: "images/placeholders/noticia3.jpg",
                category: "Social"
            },
            {
                id: 4,
                title: "Noite Cultural UCM",
                excerpt: "Celebração da diversidade cultural moçambicana com música e dança.",
                date: "28 Ago 2024",
                image: "images/placeholders/noticia4.jpg",
                category: "Cultural"
            },
            {
                id: 5,
                title: "Workshop: Preparação para o Mercado",
                excerpt: "Aprenda a criar currículo e técnicas para entrevistas de emprego.",
                date: "20 Ago 2024",
                image: "images/placeholders/noticia5.jpg",
                category: "Profissional"
            },
            {
                id: 6,
                title: "Visita Técnica à Empresa X",
                excerpt: "Conheça os processos internos de uma das maiores empresas do país.",
                date: "12 Ago 2024",
                image: "images/placeholders/noticia6.jpg",
                category: "Visita Técnica"
            }
        ];

        let visibleNews = 3;

        // Função para renderizar notícias
        const renderNews = () => {
            newsContainer.innerHTML = '';
            
            news.slice(0, visibleNews).forEach(item => {
                const newsCard = document.createElement('div');
                newsCard.className = 'news-card';
                newsCard.innerHTML = `
                    <div class="news-image">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                    </div>
                    <div class="news-content">
                        <span class="news-date">${item.date} • ${item.category}</span>
                        <h3>${item.title}</h3>
                        <p>${item.excerpt}</p>
                        <a href="#" class="read-more">Ler mais <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
                newsContainer.appendChild(newsCard);
            });

            // Atualizar botão "Carregar Mais"
            if (loadMoreBtn) {
                if (visibleNews >= news.length) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'inline-block';
                    loadMoreBtn.textContent = `Carregar Mais (${news.length - visibleNews} restantes)`;
                }
            }
        };

        // Carregar mais notícias
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                visibleNews += 3;
                renderNews();
                
                // Scroll suave para o final das notícias
                setTimeout(() => {
                    newsContainer.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'end' 
                    });
                }, 100);
            });
        }

        // Renderizar notícias iniciais
        renderNews();
    }

    // ==========================================================================
    // ANIMAÇÕES E EFEITOS
    // ==========================================================================

    initScrollEffects() {
        // Header scroll effect
        const header = document.querySelector('header');
        if (header) {
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > 100) {
                    header.style.padding = '0.5rem 0';
                    header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
                } else {
                    header.style.padding = '1rem 0';
                    header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                }
            });
        }

        // Observer para animações
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-in-up');
                }
            });
        }, observerOptions);

        // Observar elementos para animação
        document.querySelectorAll('.activity-card, .leader-card, .news-card, .gallery-item, .event-card').forEach(el => {
            observer.observe(el);
        });
    }

    initAnimations() {
        // Contadores animados
        this.initCounters();
        
        // Animar elementos ao carregar
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });
    }

    initCounters() {
        const counters = document.querySelectorAll('.stat-item h4');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.textContent.replace('+', ''));
                    const increment = target / 100;
                    let current = 0;

                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            counter.textContent = `+${Math.floor(current)}`;
                            setTimeout(updateCounter, 20);
                        } else {
                            counter.textContent = `+${target}`;
                        }
                    };

                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    initCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = this.currentYear;
        }
    }

    checkAuth() {
        // Verificar autenticação para páginas protegidas
        const token = localStorage.getItem('ucm_token');
        const currentPage = window.location.pathname;

        // Redirecionar para login se não autenticado
        if (!token && (currentPage.includes('admin.html') || currentPage.includes('area-membros.html'))) {
            window.location.href = 'index.html';
        }

        // Redirecionar para área de membros se já autenticado e na página de login
        if (token && currentPage.includes('index.html')) {
            window.location.href = 'area-membros.html';
        }
    }

    // ==========================================================================
    // NOTIFICAÇÕES
    // ==========================================================================

    showNotification(message, type = 'info', duration = 5000) {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Estilizar notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
            zIndex: '9999',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease',
            transition: 'transform 0.3s ease'
        });

        // Adicionar ao documento
        document.body.appendChild(notification);

        // Configurar botão de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });

        // Remover automaticamente
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        // Adicionar animação CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#0056a9'
        };
        return colors[type] || '#0056a9';
    }

    // ==========================================================================
    // AJUDA E SUPORTE
    // ==========================================================================

    showHelp() {
        this.showNotification(
            'Precisa de ajuda? Contacte: nucleo.estudantes@ucm.ac.mz',
            'info',
            10000
        );
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.ucmSite = new UCMSite();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UCMSite };
}