<?php
/**
 * EstudantesManager - gerencia estudantes (autenticação básica)
 */
class EstudantesManager {
    private $file;
    private $estudantes = [];

    public function __construct() {
        $this->file = __DIR__ . '/../database/estudantes.json';
        $this->loadEstudantes();
    }

    private function loadEstudantes() {
        if (file_exists($this->file)) {
            $data = json_decode(file_get_contents($this->file), true);
            $this->estudantes = $data ?: [];
            return;
        }

        // Dados de exemplo se não existir o arquivo
        $this->estudantes = [
            [
                'codigo' => '705231198',
                'email' => '705231198@ucm.ac.mz',
                'nome' => 'João Pedro',
                'perfil' => 'membro',
                'campus' => 'Maputo',
                'curso' => 'Engenharia',
                'ano' => '2',
                'senha' => password_hash('705231198@2026', PASSWORD_DEFAULT)
            ]
        ];
    }

    public function findByEmail($email) {
        $email = strtolower(trim($email));
        foreach ($this->estudantes as $est) {
            if (isset($est['email']) && strtolower($est['email']) === $email) {
                return $est;
            }
        }
        return null;
    }

    /**
     * Autentica estudante.
     * Se $senha estiver vazio, aceita apenas por email (modo permissivo).
     * Retorna array ['sucesso'=>bool, 'estudante'=>array|null, 'erro'=>string?]
     */
    public function autenticarEstudante($email, $senha = '') {
        $est = $this->findByEmail($email);
        if (!$est) {
            return ['sucesso' => false, 'erro' => 'Estudante não encontrado'];
        }

        // Se senha não fornecida, aceitar (modo sem senha)
        if ($senha === '' || $senha === null) {
            return ['sucesso' => true, 'estudante' => $est];
        }

        // Se existir campo 'senha' e for hash, usar password_verify
        if (isset($est['senha'])) {
            $hash = $est['senha'];
            if (password_verify($senha, $hash)) {
                return ['sucesso' => true, 'estudante' => $est];
            }
            // também aceitar comparação direta para casos legacy
            if ($senha === $hash) {
                return ['sucesso' => true, 'estudante' => $est];
            }
            return ['sucesso' => false, 'erro' => 'Senha inválida'];
        }

        // Sem campo senha: não podemos verificar, negar por segurança
        return ['sucesso' => false, 'erro' => 'Senha não configurada para usuário'];
    }
}
