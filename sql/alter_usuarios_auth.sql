-- Adiciona colunas usadas pela autenticação e funcionalidades de pontos/recuperação
-- Execute conectado como um usuário com permissão (ex.: postgres)

ALTER TABLE IF EXISTS usuarios
    ADD COLUMN IF NOT EXISTS saldo_pontos integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS codigo_temporario varchar(255),
    ADD COLUMN IF NOT EXISTS expiracao_codigo_temporario timestamp with time zone;

-- Opcional: índice para buscas por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
