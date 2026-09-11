/**
 * API CLIENT - Núcleo dos Estudantes UCM
 * Responsável pela comunicação com o backend
 */

class UCMSiteAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiPath = '/api';
        this.timeout = 10000; // 10 segundos
        
        this.init();
    }
    
    init() {
        console.log('🌐 API Client inicializado');
        
        // Configurar interceptors
        this.setupInterceptors();
    }
    
    setupInterceptors() {
        // Interceptor para adicionar token de autenticação
        this.beforeRequest = (config) => {
            const token = localStorage.getItem('ucm_token');
            if (token) {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            
            config.headers = config.headers || {};
            config.headers['Content-Type'] = 'application/json';
            
            return config;
        };
        
        // Interceptor para tratar erros
        this.afterResponse = (response) => {
            if (response.status === 401) {
                // Token expirado ou inválido
                localStorage.removeItem('ucm_token');
                localStorage.removeItem('ucm_estudante');
                window.location.href = 'index.html';
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            return response;
        };
    }
    
    // ==========================================================================
    // MÉTODOS HTTP
    // ==========================================================================
    
    async get(endpoint, params = {}) {
        const config = this.beforeRequest({
            method: 'GET',
            headers: {}
        });
        
        // Adicionar parâmetros à URL
        const url = new URL(`${this.baseURL}${this.apiPath}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        try {
            const response = await this.fetchWithTimeout(url, config);
            const processedResponse = this.afterResponse(response);
            return await processedResponse.json();
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }
    
    async post(endpoint, data = {}) {
        const config = this.beforeRequest({
            method: 'POST',
            body: JSON.stringify(data),
            headers: {}
        });
        
        const url = `${this.baseURL}${this.apiPath}${endpoint}`;
        
        try {
            const response = await this.fetchWithTimeout(url, config);
            const processedResponse = this.afterResponse(response);
            return await processedResponse.json();
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }
    
    async put(endpoint, data = {}) {
        const config = this.beforeRequest({
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {}
        });
        
        const url = `${this.baseURL}${this.apiPath}${endpoint}`;
        
        try {
            const response = await this.fetchWithTimeout(url, config);
            const processedResponse = this.afterResponse(response);
            return await processedResponse.json();
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }
    
    async delete(endpoint) {
        const config = this.beforeRequest({
            method: 'DELETE',
            headers: {}
        });
        
        const url = `${this.baseURL}${this.apiPath}${endpoint}`;
        
        try {
            const response = await this.fetchWithTimeout(url, config);
            const processedResponse = this.afterResponse(response);
            return await processedResponse.json();
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
    
    async upload(endpoint, file, progressCallback = null) {
        const formData = new FormData();
        formData.append('file', file);
        
        const config = this.beforeRequest({
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('ucm_token')}`
            }
        });
        
        // Remover Content-Type para permitir boundary do FormData
        delete config.headers['Content-Type'];
        
        const url = `${this.baseURL}${this.apiPath}${endpoint}`;
        
        try {
            const response = await this.fetchWithTimeout(url, config, progressCallback);
            const processedResponse = this.afterResponse(response);
            return await processedResponse.json();
        } catch (error) {
            console.error('UPLOAD Error:', error);
            throw error;
        }
    }
    
    // ==========================================================================
    // FUNÇÕES AUXILIARES
    // ==========================================================================
    
    async fetchWithTimeout(url, config, progressCallback = null) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        config.signal = controller.signal;
        
        try {
            if (progressCallback) {
                // Para upload com progresso
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const reader = response.body.getReader();
                const contentLength = +response.headers.get('Content-Length');
                let receivedLength = 0;
                let chunks = [];
                
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        break;
                    }
                    
                    chunks.push(value);
                    receivedLength += value.length;
                    
                    if (contentLength) {
                        progressCallback((receivedLength / contentLength) * 100);
                    }
                }
                
                const allChunks = new Uint8Array(receivedLength);
                let position = 0;
                for (let chunk of chunks) {
                    allChunks.set(chunk, position);
                    position += chunk.length;
                }
                
                const result = new TextDecoder("utf-8").decode(allChunks);
                return new Response(result, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            } else {
                // Requisição normal
                const response = await fetch(url, config);
                clearTimeout(timeoutId);
                return response;
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }
    
    // ==========================================================================
    // ENDPOINTS ESPECÍFICOS
    // ==========================================================================
    
    // AUTENTICAÇÃO
    async login(email, senha) {
        return this.post('/auth/login', { email, senha });
    }
    
    async logout() {
        return this.post('/auth/logout');
    }
    
    async recuperarSenha(email) {
        return this.post('/auth/recover', { email });
    }
    
    async verificarToken(token) {
        return this.get('/auth/verify', { token });
    }
    
    // NOTÍCIAS
    async getNoticias(params = {}) {
        return this.get('/noticias', params);
    }
    
    async getNoticia(id) {
        return this.get(`/noticias/${id}`);
    }
    
    async createNoticia(noticia) {
        return this.post('/noticias', noticia);
    }
    
    async updateNoticia(id, noticia) {
        return this.put(`/noticias/${id}`, noticia);
    }
    
    async deleteNoticia(id) {
        return this.delete(`/noticias/${id}`);
    }
    
    // EVENTOS
    async getEventos(params = {}) {
        return this.get('/eventos', params);
    }
    
    async getEvento(id) {
        return this.get(`/eventos/${id}`);
    }
    
    async createEvento(evento) {
        return this.post('/eventos', evento);
    }
    
    async updateEvento(id, evento) {
        return this.put(`/eventos/${id}`, evento);
    }
    
    async deleteEvento(id) {
        return this.delete(`/eventos/${id}`);
    }
    
    async inscreverEvento(eventoId, dados) {
        return this.post(`/eventos/${eventoId}/inscricao`, dados);
    }
    
    // GALERIA
    async getFotos(params = {}) {
        return this.get('/galeria', params);
    }
    
    async uploadFoto(file, progressCallback = null) {
        return this.upload('/galeria/upload', file, progressCallback);
    }
    
    async deleteFoto(id) {
        return this.delete(`/galeria/${id}`);
    }
    
    // MEMBROS
    async getMembros(params = {}) {
        return this.get('/membros', params);
    }
    
    async getMembro(id) {
        return this.get(`/membros/${id}`);
    }
    
    async createMembro(membro) {
        return this.post('/membros', membro);
    }
    
    async updateMembro(id, membro) {
        return this.put(`/membros/${id}`, membro);
    }
    
    async deleteMembro(id) {
        return this.delete(`/membros/${id}`);
    }
    
    // MENSAGENS
    async getMensagens(params = {}) {
        return this.get('/mensagens', params);
    }
    
    async getMensagem(id) {
        return this.get(`/mensagens/${id}`);
    }
    
    async marcarComoLida(id) {
        return this.put(`/mensagens/${id}/lida`);
    }
    
    async responderMensagem(id, resposta) {
        return this.post(`/mensagens/${id}/responder`, resposta);
    }
    
    async deleteMensagem(id) {
        return this.delete(`/mensagens/${id}`);
    }
    
    // ESTATÍSTICAS
    async getEstatisticas() {
        return this.get('/estatisticas');
    }
    
    async getEstatisticasPeriodo(inicio, fim) {
        return this.get('/estatisticas/periodo', { inicio, fim });
    }
    
    // CONFIGURAÇÕES
    async getConfiguracoes() {
        return this.get('/configuracoes');
    }
    
    async updateConfiguracoes(config) {
        return this.put('/configuracoes', config);
    }
    
    // ==========================================================================
    // FUNÇÕES LOCAIS (FALLBACK)
    // ==========================================================================
    
    async enviarEmailContato(dados) {
        // Fallback para envio de email quando não há backend
        console.log('Enviando email de contacto (simulado):', dados);
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Salvar no localStorage para o admin ver
        const mensagens = JSON.parse(localStorage.getItem('ucm_mensagens') || '[]');
        const novaMensagem = {
            id: mensagens.length > 0 ? Math.max(...mensagens.map(m => m.id)) + 1 : 1,
            ...dados,
            data: new Date().toISOString(),
            lida: false
        };
        
        mensagens.unshift(novaMensagem);
        localStorage.setItem('ucm_mensagens', JSON.stringify(mensagens));
        
        return {
            success: true,
            message: 'Mensagem enviada com sucesso!',
            data: novaMensagem
        };
    }
    
    // ==========================================================================
    // HEALTH CHECK
    // ==========================================================================
    
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.warn('Health check failed:', error);
            return false;
        }
    }
    
    // ==========================================================================
    // CACHE
    // ==========================================================================
    
    async getWithCache(endpoint, params = {}, ttl = 300000) { // 5 minutos default
        const cacheKey = `cache_${endpoint}_${JSON.stringify(params)}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            
            // Verificar se o cache ainda é válido
            if (Date.now() - timestamp < ttl) {
                console.log('Retornando do cache:', endpoint);
                return data;
            }
        }
        
        try {
            // Buscar dados da API
            const data = await this.get(endpoint, params);
            
            // Salvar no cache
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
            
            return data;
        } catch (error) {
            // Se a API falhar e tiver cache antigo, usar cache
            if (cached) {
                console.warn('API failed, using stale cache:', endpoint);
                const { data } = JSON.parse(cached);
                return data;
            }
            throw error;
        }
    }
    
    clearCache(pattern = '') {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_') && key.includes(pattern)) {
                localStorage.removeItem(key);
            }
        });
    }
}

// Instância global da API
window.ucmAPI = new UCMSiteAPI();

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UCMSiteAPI };
}