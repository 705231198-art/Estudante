<?php
/**
 * API REST - Núcleo dos Estudantes UCM
 * Endpoints para integração com frontend
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Incluir gerenciador de estudantes
require_once __DIR__ . '/estudantes.php';

class UCMAPI {
    private $requestMethod;
    private $endpoint;
    private $resourceId;
    private $queryParams;

    public function __construct() {
        $this->requestMethod = $_SERVER['REQUEST_METHOD'];
        $this->parseRequest();
    }

    private function parseRequest() {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $parts = explode('/', trim($path, '/'));
        // determinar endpoint após 'api' ou se chamada via index.php com body
        $apiIndex = array_search('api', $parts);
        if ($apiIndex !== false && isset($parts[$apiIndex + 1])) {
            $this->endpoint = $parts[$apiIndex + 1];
            if (isset($parts[$apiIndex + 2]) && is_numeric($parts[$apiIndex + 2])) {
                $this->resourceId = (int)$parts[$apiIndex + 2];
            }
        } else {
            // fallback: permitir endpoint via JSON body {endpoint: 'auth/login'}
            $body = json_decode(file_get_contents('php://input'), true);
            if (isset($body['endpoint'])) {
                $this->endpoint = $body['endpoint'];
            }
        }

        $this->queryParams = $_GET;
    }

    public function processRequest() {
        try {
            switch ($this->requestMethod) {
                case 'GET':
                    $this->handleGet();
                    break;
                case 'POST':
                    $this->handlePost();
                    break;
                case 'PUT':
                    $this->handlePut();
                    break;
                case 'DELETE':
                    $this->handleDelete();
                    break;
                case 'OPTIONS':
                    http_response_code(200);
                    echo json_encode([]);
                    break;
                default:
                    $this->sendResponse(405, ['error' => 'Método não permitido']);
            }
        } catch (Exception $e) {
            $this->sendResponse(500, ['error' => 'Erro interno', 'message' => $e->getMessage()]);
        }
    }

    private function handleGet() {
        // Carregar dados da pasta database
        $dbPath = __DIR__ . '/../database';
        $noticiasFile = $dbPath . '/noticias.json';
        $eventosFile = $dbPath . '/eventos.json';
        $membrosFile = $dbPath . '/membros.json';
        $mensagensFile = $dbPath . '/mensagens.json';

        $noticias = file_exists($noticiasFile) ? json_decode(file_get_contents($noticiasFile), true) : [];
        $eventos = file_exists($eventosFile) ? json_decode(file_get_contents($eventosFile), true) : [];
        $membros = file_exists($membrosFile) ? json_decode(file_get_contents($membrosFile), true) : [];
        $mensagens = file_exists($mensagensFile) ? json_decode(file_get_contents($mensagensFile), true) : [];

        switch ($this->endpoint) {
            case 'noticias':
                if ($this->resourceId) {
                    $item = $this->findResource($noticias, $this->resourceId);
                    if (!$item) $this->sendResponse(404, ['error' => 'Notícia não encontrada']);
                    $this->sendResponse(200, ['data' => $item]);
                }
                $this->sendResponse(200, ['data' => array_values($noticias)]);
                break;
            case 'eventos':
                if ($this->resourceId) {
                    $item = $this->findResource($eventos, $this->resourceId);
                    if (!$item) $this->sendResponse(404, ['error' => 'Evento não encontrado']);
                    $this->sendResponse(200, ['data' => $item]);
                }
                $this->sendResponse(200, ['data' => array_values($eventos)]);
                break;
            case 'membros':
                $this->sendResponse(200, ['data' => array_values($membros)]);
                break;
            case 'estatisticas':
                $estat = [
                    'noticias' => count($noticias),
                    'eventos' => count($eventos),
                    'membros' => count($membros),
                    'mensagens' => count($mensagens)
                ];
                $this->sendResponse(200, ['data' => $estat]);
                break;
            default:
                $this->sendResponse(404, ['error' => 'Endpoint não encontrado']);
        }
    }

    private function handlePost() {
        $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        if (!$data) $data = [];

        switch ($this->endpoint) {
            case 'auth/login':
                $this->postLogin($data);
                break;
            case 'contato':
                $this->postContato($data);
                break;
            default:
                $this->sendResponse(404, ['error' => 'Endpoint não encontrado']);
        }
    }

    private function postLogin($data) {
        $email = $data['email'] ?? '';
        $senha = $data['password'] ?? ($data['senha'] ?? '');

        if (empty($email)) {
            $this->sendResponse(400, ['error' => 'Email é obrigatório']);
            return;
        }

        $estMgr = new EstudantesManager();
        $resultado = $estMgr->autenticarEstudante($email, $senha);

        if (!$resultado['sucesso']) {
            $this->sendResponse(401, ['success' => false, 'error' => $resultado['erro']]);
            return;
        }

        $est = $resultado['estudante'];
        $token = base64_encode(json_encode(['sub' => $est['codigo'], 'email' => $est['email'], 'iat' => time(), 'exp' => time() + 86400]));

        $this->sendResponse(200, ['success' => true, 'token' => $token, 'estudante' => $est, 'mensagem' => 'Login bem-sucedido']);
    }

    private function postContato($data) {
        // Reaproveitar php/send-email.php behavior
        $file = __DIR__ . '/../database/mensagens.json';
        $msgs = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
        $novo = [
            'id' => uniqid(),
            'nome' => $data['nome'] ?? '',
            'email' => $data['email'] ?? '',
            'mensagem' => $data['mensagem'] ?? '',
            'data' => date('Y-m-d H:i:s')
        ];
        $msgs[] = $novo;
        file_put_contents($file, json_encode($msgs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->sendResponse(201, ['success' => true, 'message' => 'Mensagem recebida', 'data' => $novo]);
    }

    private function handlePut() { $this->sendResponse(200, ['ok' => true]); }
    private function handleDelete() { $this->sendResponse(200, ['ok' => true]); }

    private function sendResponse($statusCode, $data) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$api = new UCMAPI();
$api->processRequest();
