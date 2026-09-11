<?php
header('Content-Type: application/json');

// Aceita JSON no corpo ou dados de formulário
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$nome = trim($input['nome'] ?? '');
$email = trim($input['email'] ?? '');
$mensagem = trim($input['mensagem'] ?? $input['mensagem'] ?? '');
$assunto = trim($input['assunto'] ?? '');

if (empty($nome) || empty($email) || empty($mensagem)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

$file = __DIR__ . '/../database/mensagens.json';
$msgs = [];
if (file_exists($file)) {
    $msgs = json_decode(file_get_contents($file), true) ?: [];
}

$novo = [
    'id' => uniqid(),
    'nome' => htmlspecialchars($nome),
    'email' => filter_var($email, FILTER_SANITIZE_EMAIL),
    'assunto' => htmlspecialchars($assunto),
    'mensagem' => htmlspecialchars($mensagem),
    'data' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
];

$msgs[] = $novo;
file_put_contents($file, json_encode($msgs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success' => true, 'message' => 'Mensagem enviada com sucesso', 'data' => $novo]);
