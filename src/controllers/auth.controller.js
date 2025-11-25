import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import Usuario from '../models/Usuario.model.js';
import TransacaoPontos from '../models/TransacaoPontos.model.js';
import { enviarEmailDeNotificacao } from '../utils/sendMail.js';

// Helper para gerar token de acesso
function gerarAccessToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}
// Helper para gerar refresh token (expiração maior)
function gerarRefreshToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');
  return jwt.sign({ ...payload, tipo: 'refresh' }, secret, { expiresIn: '7d' });
}

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).send({ message: 'Email e senha são obrigatórios.' });
    }
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).send({ message: 'Credenciais inválidas.' });
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      return res.status(401).send({ message: 'Credenciais inválidas.' });
    }
    const payload = { id: usuario.id, nome: usuario.nome, tipoUsuario: usuario.tipoUsuario };
    const accessToken = gerarAccessToken(payload);
    const refreshToken = gerarRefreshToken(payload);

    return res.status(200).send({
      message: 'Login bem-sucedido',
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const refresh = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).send({ message: 'Refresh token é obrigatório.' });
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    if (decoded.tipo !== 'refresh') {
      return res.status(400).send({ message: 'Token inválido para refresh.' });
    }
    const novoAccessToken = gerarAccessToken({ id: decoded.id, nome: decoded.nome, tipoUsuario: decoded.tipoUsuario });
    return res.status(200).send({ accessToken: novoAccessToken });
  } catch (error) {
    return res.status(401).send({ message: 'Refresh token inválido ou expirado.' });
  }
};

const me = async (req, res) => {
  try {
    if (!req.usuario?.id) return res.status(401).send({ message: 'Não autenticado.' });
    const usuario = await Usuario.findOne({
      where: { id: req.usuario.id },
      attributes: { exclude: ['senhaHash'] }
    });
    if (!usuario) return res.status(404).send({ message: 'Usuário não encontrado.' });
    const saldo = (await TransacaoPontos.sum('pontos', { where: { usuarioId: usuario.id } })) || 0;
    return res.status(200).send({ data: { ...usuario.toJSON(), saldoPontos: saldo } });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

// Solicitação de recuperação de senha (stateful com código)
const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: 'Email é obrigatório.' });

    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
        // Resposta uniforme
        return res.status(200).send({ message: 'Se um utilizador com este email existir, um código de recuperação foi enviado.' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraCodigo = new Date();
    expiraCodigo.setMinutes(expiraCodigo.getMinutes() + 30);

    usuario.codigoTemporario = codigo;
    usuario.expiracaoCodigoTemporario = expiraCodigo;
    await usuario.save();

    const corpoEmail = `<p>Olá, ${usuario.nome},</p>
        <p>Seu código de recuperação de senha é: <strong>${codigo}</strong></p>
        <p>Este código expira em 30 minutos.</p>`;

    try { 
        await enviarEmailDeNotificacao(usuario.email, usuario.nome, 'Recuperação de Senha', corpoEmail); 
    } catch (e) {
        console.error('Erro ao enviar email:', e);
    }

    return res.status(200).send({ message: 'Se um utilizador com este email existir, um código de recuperação foi enviado.' });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

// Redefinição de senha via código
const redefinirSenha = async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body;
    if (!email || !codigo || !novaSenha) {
        return res.status(400).send({ message: 'Email, código e nova senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
        return res.status(404).send({ message: 'Utilizador não encontrado.' });
    }

    if (usuario.codigoTemporario !== codigo) {
        return res.status(400).send({ message: 'Código inválido.' });
    }

    if (new Date() > usuario.expiracaoCodigoTemporario) {
        return res.status(400).send({ message: 'Código expirado.' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    usuario.senhaHash = senhaHash;
    usuario.codigoTemporario = null;
    usuario.expiracaoCodigoTemporario = null;
    await usuario.save();

    return res.status(200).send({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export default { login, refresh, me, solicitarRecuperacaoSenha, redefinirSenha };
