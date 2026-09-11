/**
 * SISTEMA DE AUTENTICAÇÃO - Núcleo dos Estudantes UCM
 * Responsável pelo login, logout e controle de acesso
 */

class AuthManager {
    constructor() {
        this.usuario = null;
        this.init();
    }
    
    init() {
        console.log('🔐 Auth Manager inicializado');
        
        // Verificar se estamos em uma página de autenticação
        if (this.isAuthPage()) {
            this.setupAuthPage();
        } else if (this.isProtectedPage()) {
            this.checkAuth();
        }
        
        // Configurar event listeners globais
        this.setupGlobalListeners();
    }
    
    isAuthPage() {
        const path = window.location.pathname;
        return path.includes('login.html') || path.includes('register.html');
    }
    
    isProtectedPage() {
        const path = window.location.pathname;
        return path.includes('admin.html') || path.includes('area-membros.html');
    }
    
    setupAuthPage() {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailEl = document.getElementById('email');
                const rememberEl = document.getElementById('rememberMe');

                if (!emailEl) {
                    this.mostrarMensagemAuth('Campo de email não encontrado na página.', 'error');
                    return;
                }

                const email = (emailEl.value || '').trim();
                const rememberMe = !!(rememberEl && rememberEl.checked);

                if (!email) {
                    this.mostrarMensagemAuth('Por favor, insira o email institucional.', 'error');
                    return;
                }

                await this.fazerLogin(email, rememberMe);
            });
        }
        
        // Verificar se já está logado
        this.checkAlreadyLoggedIn();
    }
    
    setupGlobalListeners() {
        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.fazerLogout();
            }
        });
    }
    
    // ==========================================================================
    // AUTENTICAÇÃO
    // ==========================================================================
    
    async fazerLogin(email, rememberMe = false) {
        // Validação de email institucional
        const validacaoEmail = this.validarEmailInstitucional(email);
        if (!validacaoEmail.valido) {
            this.mostrarMensagemAuth(validacaoEmail.mensagem, 'error');
            return;
        }
        
        // Mostrar loading
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Autenticando...';
        submitBtn.disabled = true;
        
        try {
            // Construir URLs possíveis a testar
            const urlsPossiveis = this.construirUrlsApi();
            
            console.log('=== LOGIN REQUEST ===');
            console.log('Email:', email);
            console.log('URLs a testar:', urlsPossiveis);
            
            // Tentar fazer login com cada URL
            let resultado = null;
            let ultimoErro = null;
            
            for (const apiUrl of urlsPossiveis) {
                try {
                    console.log(`Tentando URL: ${apiUrl}`);
                    
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({
                            endpoint: 'auth/login',
                            email: email.toLowerCase()
                        })
                    });
                    
                    console.log(`Status: ${response.status}`);
                    
                    // Se conseguiu conectar com sucesso
                    if (response.ok) {
                        try {
                            const text = await response.text();
                            console.log('Response:', text.substring(0, 100));
                            resultado = JSON.parse(text);
                            console.log(`✓ Conectado em: ${apiUrl}`);
                            break; // Saiu do loop se conseguiu
                        } catch (parseError) {
                            console.error('Erro ao parsear JSON:', parseError);
                            ultimoErro = 'Resposta inválida do servidor';
                            continue;
                        }
                    } else {
                        // Tentar ler a resposta mesmo com erro
                        try {
                            const text = await response.text();
                            resultado = JSON.parse(text);
                            console.log(`Resposta com erro (${response.status}):`, resultado);
                            break;
                        } catch (e) {
                            console.log(`Status ${response.status}, tentando próxima URL...`);
                            ultimoErro = `Erro do servidor: ${response.status}`;
                            continue;
                        }
                    }
                } catch (fetchError) {
                    console.error(`Falha com ${apiUrl}:`, fetchError.message);
                    ultimoErro = fetchError.message;
                    // Continuar para próxima URL
                    continue;
                }
            }
            
            // Se nenhuma URL funcionou
            if (!resultado) {
                console.error('=== NENHUMA URL FUNCIONALOU ===');
                console.error('Último erro:', ultimoErro);
                
                this.mostrarMensagemAuth(
                    '❌ Erro de conexão: Não foi possível conectar ao servidor.<br>' +
                    '📌 Dica: Abra o arquivo "iniciar-servidor.bat" para iniciar o servidor local.',
                    'error'
                );
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Processar resultado
            if (resultado.success) {
                console.log('=== LOGIN SUCCESS ===');
                console.log('Estudante:', resultado.estudante);
                await this.processarLoginSucesso(resultado, rememberMe);
            } else {
                console.error('Login Error:', resultado.error);
                const mensagem = resultado.error || 'Email não encontrado.';
                this.mostrarMensagemAuth(mensagem, 'error');
            }
            
        } catch (error) {
            console.error('=== ERRO INESPERADO ===');
            console.error('Tipo:', error.name);
            console.error('Mensagem:', error.message);
            console.error('Stack:', error.stack);
            
            this.mostrarMensagemAuth(
                '❌ Erro inesperado. Abra o console (F12) para ver detalhes.',
                'error'
            );
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    /**
     * Constrói lista de URLs possíveis da API
     */
    construirUrlsApi() {
        const urls = [];
        const baseDir = window.location.pathname.split('/').slice(0, -1).join('/');
        const origin = window.location.origin;
        
        // 1. URL relativa baseado no diretório atual
        urls.push(baseDir + '/api/index.php');
        
        // 2. URL absoluta completa
        urls.push(origin + baseDir + '/api/index.php');
        
        // 3. Possível pasta específica
        if (!baseDir.includes('nucleo-estudantes')) {
            urls.push(origin + '/nucleo-estudantes/api/index.php');
            urls.push('/nucleo-estudantes/api/index.php');
        }
        
        // 4. Raiz do site
        urls.push('/api/index.php');
        urls.push(origin + '/api/index.php');
        
        return urls;
    }
    
    /**
     * Valida email institucional (codigoestudante@ucm.ac.mz)
     */
    validarEmailInstitucional(email) {
        const regex = /^(\d{9})@ucm\.ac\.mz$/i;
        
        if (!regex.test(email)) {
            return {
                valido: false,
                mensagem: 'Email deve estar no formato: CODIGOESTUDANTE@ucm.ac.mz (ex: 705231198@ucm.ac.mz)'
            };
        }
        
        const codigo = email.match(regex)[1];
        
        // Validação básica: código deve ter dígitos variados
        const unicos = [...new Set(codigo)].length;
        if (unicos < 3) {
            return {
                valido: false,
                mensagem: 'Código de estudante inválido'
            };
        }
        
        return { valido: true };
    }
    
    async processarLoginSucesso(resultado, rememberMe) {
        const estudante = resultado.estudante;
        
        // Salvar dados de session
        localStorage.setItem('ucm_token', resultado.token);
        localStorage.setItem('ucm_estudante', JSON.stringify(estudante));
        
        if (rememberMe) {
            localStorage.setItem('ucm_remember', 'true');
            localStorage.setItem('ucm_email_remember', estudante.email);
        }
        
        // Mostrar mensagem de sucesso
        this.mostrarMensagemAuth(`Bem-vindo, ${estudante.nome}! Redirecionando...`, 'success');
        
        // Aguardar um pouco para mostrar a mensagem
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirecionar
        this.redirecionarAposLogin(estudante);
    }
    
    redirecionarAposLogin(estudante) {
        // Redirecionar baseado no perfil
        let redirectTo = 'area-membros.html';
        
        if (estudante.perfil === 'administrador') {
            redirectTo = 'admin.html';
        }
        
        window.location.href = redirectTo;
    }
    
    fazerLogout() {
        // Limpar dados de autenticação
        localStorage.removeItem('ucm_token');
        localStorage.removeItem('ucm_remember');
        
        // Manter estudante se quiser lembrar dados para próximo login
        if (!localStorage.getItem('ucm_remember')) {
            localStorage.removeItem('ucm_estudante');
        }
        
        // Redirecionar para login
                window.location.href = 'index.html';
    }
    
    // ==========================================================================
    // CONTROLE DE ACESSO
    // ==========================================================================
    
    checkAuth() {
        const token = localStorage.getItem('ucm_token');
        const estudanteSalvo = localStorage.getItem('ucm_estudante');

        // Não bloquear acesso à área de membros — permitir modo visitante.
        // Bloquear apenas páginas administrativas sensíveis.
        if (!token || !estudanteSalvo) {
            if (window.location.pathname.includes('admin.html')) {
                this.redirectToLogin();
                return;
            }
            // Para area-membros, permitir continuar como visitante
        }

        this.usuario = JSON.parse(estudanteSalvo);
        
        // Verificar se o usuário tem acesso à página atual
        if (!this.temAcessoAPagina()) {
            this.redirectToUnauthorized();
        }
        
        // Atualizar último acesso
        this.atualizarUltimoAcesso();
    }
    
    checkAlreadyLoggedIn() {
        const token = localStorage.getItem('ucm_token');
        const estudanteSalvo = localStorage.getItem('ucm_estudante');

        if (token && estudanteSalvo) {
            // Já está logado, redirecionar
            this.usuario = JSON.parse(estudanteSalvo);
            this.redirecionarAposLogin(this.usuario);
        }
    }
    
    temAcessoAPagina() {
        if (!this.usuario) return false;
        
        const path = window.location.pathname;
        
        // Páginas públicas - todos têm acesso
        if (path.includes('index.html') || path.includes('galeria.html') || 
            path.includes('calendario.html') || path === '/') {
            return true;
        }
        
        // Admin - apenas admin e presidente
        if (path.includes('admin.html')) {
            return this.usuario.perfil === 'admin' || this.usuario.perfil === 'presidente';
        }
        
        // Área de membros - permitir acesso mesmo para visitante (modo limitado)
        if (path.includes('area-membros.html')) {
            return true;
        }
        
        // Por padrão, negar acesso
        return false;
    }
    
    redirectToLogin() {
        // Salvar a URL atual para redirecionar após login
        const currentUrl = window.location.pathname + window.location.search;
        if (!currentUrl.includes('index.html')) {
            sessionStorage.setItem('redirectAfterLogin', currentUrl);
        }
        
        window.location.href = 'index.html';
    }
    
    redirectToUnauthorized() {
        // Redirecionar para página não autorizada ou dashboard
        if (this.usuario.perfil === 'admin' || this.usuario.perfil === 'presidente') {
            window.location.href = 'admin.html';
        } else if (this.usuario.perfil !== 'visitante') {
            window.location.href = 'area-membros.html';
        } else {
            window.location.href = 'index.html';
        }
    }
    
    atualizarUltimoAcesso() {
        if (this.usuario) {
            this.usuario.ultimoAcesso = new Date().toISOString();
            localStorage.setItem('ucm_estudante', JSON.stringify(this.usuario));
        }
    }
    
    // ==========================================================================
    // FORM MANAGEMENT
    // ==========================================================================
    
    // ==========================================================================
    // MENSAGENS E NOTIFICAÇÕES
    // ==========================================================================
    
    mostrarMensagemAuth(texto, tipo) {
        const container = document.getElementById('authMessages');
        if (!container) {
            // Se não houver container, usar alert
            alert(texto);
            return;
        }
        
        // Remover mensagens anteriores
        const existingMessages = container.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 300);
        });
        
        // Criar nova mensagem
        const mensagem = document.createElement('div');
        mensagem.className = `auth-message ${tipo}`;
        mensagem.innerHTML = `
            <i class="fas fa-${this.getIconeMensagem(tipo)}"></i>
            <span>${texto}</span>
            <button class="message-close">&times;</button>
        `;
        
        container.appendChild(mensagem);
        
        // Fechar mensagem
        mensagem.querySelector('.message-close').addEventListener('click', () => {
            mensagem.style.opacity = '0';
            setTimeout(() => mensagem.remove(), 300);
        });
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (mensagem.parentNode) {
                mensagem.style.opacity = '0';
                setTimeout(() => mensagem.remove(), 300);
            }
        }, 5000);
    }
    
    getIconeMensagem(tipo) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[tipo] || 'info-circle';
    }
    
    // ==========================================================================
    // VALIDAÇÕES
    // ==========================================================================
    
    validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validarSenha(senha) {
        // Mínimo 6 caracteres
        return senha.length >= 6;
    }
    
    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================
    
    getUsuarioAtual() {
        if (!this.usuario) {
            const usuarioSalvo = localStorage.getItem('ucm_estudante');
            if (usuarioSalvo) {
                this.usuario = JSON.parse(usuarioSalvo);
            }
        }
        return this.usuario;
    }
    
    isAdmin() {
        const usuario = this.getUsuarioAtual();
        return usuario && (usuario.perfil === 'admin' || usuario.perfil === 'presidente');
    }
    
    isMembro() {
        const usuario = this.getUsuarioAtual();
        return usuario && usuario.perfil !== 'visitante';
    }
    
    getCampusUsuario() {
        const usuario = this.getUsuarioAtual();
        return usuario ? usuario.campus : null;
    }
    
    // ==========================================================================
    // SESSÃO E EXPIRAÇÃO
    // ==========================================================================
    
    verificarSessaoExpirada() {
        const usuario = this.getUsuarioAtual();
        if (!usuario || !usuario.ultimoAcesso) return true;
        
        const ultimoAcesso = new Date(usuario.ultimoAcesso);
        const agora = new Date();
        const diferencaHoras = (agora - ultimoAcesso) / (1000 * 60 * 60);
        
        // Sessão expira após 24 horas
        if (diferencaHoras > 24) {
            this.fazerLogout();
            return true;
        }
        
        return false;
    }
    
    // ==========================================================================
    // REGISTRO (para implementação futura)
    // ==========================================================================
    
    async registrarUsuario(dados) {
        // Em produção, enviaria para o servidor
        console.log('Registrando usuário:', dados);
        
        // Validação
        if (!this.validarEmail(dados.email)) {
            throw new Error('Email inválido');
        }
        
        if (!this.validarSenha(dados.senha)) {
            throw new Error('Senha deve ter pelo menos 6 caracteres');
        }
        
        if (dados.senha !== dados.confirmarSenha) {
            throw new Error('As senhas não coincidem');
        }
        
        // Simular registro
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            message: 'Usuário registrado com sucesso!',
            usuario: {
                email: dados.email,
                nome: dados.nome,
                perfil: 'membro',
                campus: dados.campus || 'Maputo'
            }
        };
    }
}

// Inicializar auth manager quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager };
}