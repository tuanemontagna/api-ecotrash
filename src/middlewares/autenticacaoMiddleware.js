import jwt from 'jsonwebtoken';
import 'dotenv/config'; // Garante que as variáveis de ambiente (como o segredo JWT) sejam carregadas

// Middleware para verificar se o utilizador está autenticado
const checkAuth = (req, res, next) => {
    // Obtém o token do cabeçalho da autorização
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    if (!token) {
        return res.status(401).send({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        // Verifica se o token é válido usando o segredo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Anexa os dados do utilizador (payload do token) ao objeto da requisição
        req.usuario = decoded;
        
        next(); // Passa para a próxima função (o controller)
    } catch (error) {
        return res.status(403).send({ message: 'Token inválido ou expirado.' });
    }
};

// Middleware para verificar se o utilizador é um Administrador
const isAdmin = (req, res, next) => {
    // Este middleware deve ser usado DEPOIS do checkAuth
    if (req.usuario && req.usuario.tipoUsuario === 'ADMIN') {
        next();
    } else {
        return res.status(403).send({ message: 'Acesso restrito a administradores.' });
    }
};

export { checkAuth, isAdmin };
