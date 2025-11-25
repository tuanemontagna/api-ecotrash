import 'dotenv/config';
import { sequelize } from "../config/postgres.js";
import { Op } from "sequelize";
import Usuario from "../models/Usuario.model.js";
import Endereco from "../models/Endereco.model.js";
import Voucher from "../models/Voucher.model.js";
import UsuarioVoucher from "../models/UsuarioVoucher.model.js";
import TransacaoPontos from "../models/TransacaoPontos.model.js";
import Campanha from "../models/Campanha.model.js";
import CodigoDiarioPontoColeta from "../models/CodigoDiarioPontoColeta.model.js";
import ResgateUsuario from "../models/ResgateUsuario.model.js";
import "../models/UsuarioEndereco.model.js";
import "../models/UsuarioCampanha.model.js";
import bcrypt from "bcrypt";
import { enviarEmailDeNotificacao } from "../utils/sendMail.js";

// helper para calcular saldo atual do usuário via transacoes_pontos
const calcularSaldoPontos = async (usuarioId, t = undefined) => {
    const soma = await TransacaoPontos.sum("pontos", { where: { usuarioId }, transaction: t });
    return soma || 0;
};

const create = async (corpo) => {
    try {
        const { nome, email, senha, telefone, tipoUsuario, cpf } = corpo;

        if (!senha) {
            throw new Error("A senha é obrigatória.");
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const response = await Usuario.create({
            nome,
            email,
            senhaHash,
            telefone,
            tipoUsuario,
            cpf,
        });

        return response;
    } catch (error) {
        throw error;
    }
};

const update = async (corpo, id) => {
    try {
        const response = await Usuario.findOne({
            where: { id },
        });

        if (!response) {
            throw new Error("Usuário não encontrado para atualização.");
        }

        if (corpo.senha) {
            corpo.senhaHash = await bcrypt.hash(corpo.senha, 10);
            delete corpo.senha;
        }

        Object.keys(corpo).forEach((item) => (response[item] = corpo[item]));
        await response.save();
        return response;
    } catch (error) {
        throw error;
    }
};

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            const usuarios = await Usuario.findAll({
                order: [['id', 'desc']],
                attributes: { exclude: ['senhaHash'] }
            });

            // calcular saldos em lote
            const saldos = await TransacaoPontos.findAll({
                attributes: ['usuarioId', [sequelize.fn('SUM', sequelize.col('pontos')), 'saldo']],
                group: ['usuarioId']
            });
            const saldosMap = new Map(saldos.map(s => [s.get('usuarioId'), Number(s.get('saldo'))]));

            const data = usuarios.map(u => ({ ...u.toJSON(), saldoPontos: saldosMap.get(u.id) ?? 0 }));

            return res.status(200).send({
                message: `${data.length} usuários encontrados.`,
                data,
            });
        }

        const response = await Usuario.findOne({
            where: { id },
            attributes: { exclude: ['senhaHash'] }
        });

        if (!response) {
            return res.status(404).send('Usuário não encontrado.');
        }

        const saldo = await calcularSaldoPontos(response.id);
        return res.status(200).send({
            message: 'Usuário encontrado.',
            data: { ...response.toJSON(), saldoPontos: saldo },
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

const persist = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            const response = await create(req.body);
            return res.status(201).send({
                message: 'Usuário criado com sucesso.',
                data: response
            });
        }

        const response = await update(req.body, id);
        return res.status(200).send({
            message: 'Usuário atualizado com sucesso.',
            data: response
        });

    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send({
                message: 'Erro de validação',
                errors: error.errors.map(e => e.message)
            });
        }
        return res.status(500).send({
            message: error.message
        });
    }
}

const destroy = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            return res.status(400).send('Por favor, informe o ID do usuário a ser deletado.');
        }

        const response = await Usuario.findOne({ where: { id } });

        if (!response) {
            return res.status(404).send('Usuário não encontrado.');
        }
        await response.destroy();

        return res.status(200).send({
            message: 'Usuário deletado com sucesso.',
            data: response
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

const addEndereco = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { apelidoEndereco, isPrincipal, ...dadosEndereco } = req.body;

        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        const novoEndereco = await Endereco.create(dadosEndereco);

        await usuario.addEndereco(novoEndereco, {
            through: { apelidoEndereco, isPrincipal }
        });

        return res.status(201).send({
            message: 'Endereço adicionado com sucesso!',
            data: novoEndereco,
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const listEnderecos = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const usuario = await Usuario.findByPk(usuarioId, {
            include: {
                model: Endereco,
                as: 'enderecos',
                through: {
                    attributes: ['apelidoEndereco', 'isPrincipal']
                }
            }
        });

        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        return res.status(200).send({
            message: `Encontrados ${usuario.enderecos.length} endereços.`,
            data: usuario.enderecos
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const updateEndereco = async (req, res) => {
    try {
        const { usuarioId, enderecoId } = req.params;
        const corpo = req.body;

        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }
        
        const enderecos = await usuario.getEnderecos({ where: { id: enderecoId } });
        if (!enderecos || enderecos.length === 0) {
            return res.status(404).send({ message: 'Endereço não encontrado ou não pertence a este usuário.' });
        }

        const enderecoParaAtualizar = enderecos[0];
        
        Object.keys(corpo).forEach((item) => enderecoParaAtualizar[item] = corpo[item]);
        await enderecoParaAtualizar.save();

        if (corpo.apelidoEndereco || corpo.isPrincipal !== undefined) {
            const dadosLigacao = {};
            if (corpo.apelidoEndereco) dadosLigacao.apelidoEndereco = corpo.apelidoEndereco;
            if (corpo.isPrincipal !== undefined) dadosLigacao.isPrincipal = corpo.isPrincipal;
            await usuario.addEndereco(enderecoParaAtualizar, { through: dadosLigacao });
        }
        
        return res.status(200).send({
            message: 'Endereço atualizado com sucesso!',
            data: enderecoParaAtualizar,
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};


const destroyEndereco = async (req, res) => {
    try {
        const { usuarioId, enderecoId } = req.params;

        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        const endereco = await Endereco.findByPk(enderecoId);
        if (!endereco) {
            return res.status(404).send({ message: 'Endereço não encontrado.' });
        }

        const result = await usuario.removeEndereco(endereco);

        if (result === 0) {
            return res.status(404).send({ message: 'Endereço não estava associado a este usuário.' });
        }

        await endereco.destroy();

        return res.status(200).send({ message: 'Endereço removido do usuário com sucesso.' });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const resgatarVoucher = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { usuarioId } = req.params;
        const { voucherId } = req.body;

        if (!voucherId) {
            return res.status(400).send({ message: 'O ID do voucher é obrigatório.' });
        }

    const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
        const voucher = await Voucher.findByPk(voucherId, { transaction: t });

        if (!usuario) {
            await t.rollback();
            return res.status(404).send({ message: 'Utilizador não encontrado.' });
        }
        if (usuario.tipoUsuario !== 'PESSOA_FISICA') {
             await t.rollback();
            return res.status(403).send({ message: 'Apenas pessoas físicas podem resgatar vouchers.' });
        }
        if (!voucher) {
            await t.rollback();
            return res.status(404).send({ message: 'Voucher não encontrado.' });
        }
        if (voucher.quantidadeDisponivel !== null && voucher.quantidadeDisponivel <= 0) {
            await t.rollback();
            return res.status(400).send({ message: 'Este voucher está esgotado.' });
        }
        const saldoAtual = await calcularSaldoPontos(usuario.id, t);
        if (saldoAtual < voucher.custoPontos) {
            await t.rollback();
            return res.status(400).send({ message: 'Pontos insuficientes para resgatar este voucher.' });
        }
        if (voucher.quantidadeDisponivel !== null) {
            voucher.quantidadeDisponivel -= 1;
        }

        const codigoGerado = `ECO-${voucher.id}-${Date.now()}`;

        const resgate = await UsuarioVoucher.create({
            usuarioId,
            voucherId,
            pontosGastos: voucher.custoPontos,
            codigoVoucherGerado: codigoGerado,
        }, { transaction: t });

        await TransacaoPontos.create({
            usuarioId,
            tipoTransacao: 'GASTO_VOUCHER',
            pontos: -voucher.custoPontos,
            descricao: `Resgate do voucher: ${voucher.titulo}`,
            referenciaId: resgate.id,
        }, { transaction: t });

        await voucher.save({ transaction: t });

        await t.commit();

        return res.status(201).send({
            message: 'Voucher resgatado com sucesso!',
            data: {
                codigoResgate: codigoGerado,
                voucherInfo: voucher.titulo
            }
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).send({ message: error.message });
    }
};

const apoiarCampanha = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { usuarioId } = req.params;
        const { campanhaId } = req.body;

        if (!campanhaId) {
            return res.status(400).send({ message: 'O ID da campanha é obrigatório.' });
        }

        const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
        const campanha = await Campanha.findByPk(campanhaId, { transaction: t });

        if (!usuario || !campanha) {
            await t.rollback();
            return res.status(404).send({ message: 'Usuário ou Campanha não encontrado(a).' });
        }
        if (!campanha.ativa) {
            await t.rollback();
            return res.status(400).send({ message: 'Esta campanha não está mais ativa.' });
        }

        const jaApoia = await usuario.hasCampanhasApoiada(campanha);
        if (jaApoia) {
            await t.rollback();
            return res.status(400).send({ message: 'Você já apoia esta campanha.' });
        }

        await usuario.addCampanhasApoiada(campanha, { transaction: t });

        const pontosGanhos = campanha.pontosPorAdesao;
        if (pontosGanhos > 0) {
            await TransacaoPontos.create({
                usuarioId,
                tipoTransacao: 'GANHO_CAMPANHA',
                pontos: pontosGanhos,
                descricao: `Apoio à campanha: ${campanha.titulo}`,
                referenciaId: campanha.id,
            }, { transaction: t });
        }

        await t.commit();

        return res.status(200).send({
            message: `Você agora está apoiando a campanha "${campanha.titulo}"!`,
            pontosGanhos: pontosGanhos > 0 ? pontosGanhos : undefined
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).send({ message: error.message });
    }
};

const deixarCampanha = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { usuarioId } = req.params;
        const { campanhaId } = req.body;

        if (!campanhaId) {
            return res.status(400).send({ message: 'O ID da campanha é obrigatório.' });
        }

        const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
        const campanha = await Campanha.findByPk(campanhaId, { transaction: t });

        if (!usuario || !campanha) {
            await t.rollback();
            return res.status(404).send({ message: 'Usuário ou Campanha não encontrado(a).' });
        }

        const jaApoia = await usuario.hasCampanhasApoiada(campanha, { transaction: t });
        if (!jaApoia) {
            await t.rollback();
            return res.status(400).send({ message: 'Você não está apoiando esta campanha.' });
        }

        await usuario.removeCampanhasApoiada(campanha, { transaction: t });

        // Verificar se houve ganho de pontos ao apoiar e reverter
        const transacaoGanho = await TransacaoPontos.findOne({
            where: {
                usuarioId,
                referenciaId: campanha.id,
                tipoTransacao: 'GANHO_CAMPANHA',
                pontos: { [Op.gt]: 0 }
            },
            order: [['data_transacao', 'DESC']],
            transaction: t
        });

        if (transacaoGanho) {
            await TransacaoPontos.create({
                usuarioId,
                tipoTransacao: 'GANHO_CAMPANHA',
                pontos: -transacaoGanho.pontos,
                descricao: `Saiu da campanha: ${campanha.titulo}`,
                referenciaId: campanha.id,
            }, { transaction: t });
        } else if (campanha.pontosPorAdesao > 0) {
             await TransacaoPontos.create({
                usuarioId,
                tipoTransacao: 'GANHO_CAMPANHA',
                pontos: -campanha.pontosPorAdesao,
                descricao: `Saiu da campanha: ${campanha.titulo}`,
                referenciaId: campanha.id,
            }, { transaction: t });
        }
        
        await t.commit();

        return res.status(200).send({
            message: `Você deixou de apoiar a campanha "${campanha.titulo}".`
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).send({ message: error.message });
    }
};

// Login movido para auth.controller

const recuperacaoSenha = async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
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

        await enviarEmailDeNotificacao(usuario.email, usuario.nome, 'Recuperação de Senha', corpoEmail);
        console.log(`Email de recuperação para ${usuario.email} com o código ${codigo}`);

        return res.status(200).send({
            message: 'Se um utilizador com este email existir, um código de recuperação foi enviado.',
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const redefinirSenha = async (req, res) => {
    try {
        const { email, codigo, novaSenha } = req.body;
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

        return res.status(200).send({
            message: 'Senha redefinida com sucesso.',
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const resgatarCodigoDiario = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { usuarioId } = req.params;
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(400).send({ message: 'O código é obrigatório.' });
        }

        const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(404).send({ message: 'Utilizador não encontrado.' });
        }

        // Encontra o código que é válido para a data de hoje
        const hoje = new Date().toISOString().slice(0, 10);
        const codigoDiario = await CodigoDiarioPontoColeta.findOne({
            where: { codigo: codigo, dataValidade: hoje }
        }, { transaction: t });

        if (!codigoDiario) {
            await t.rollback();
            return res.status(404).send({ message: 'Código inválido ou expirado.' });
        }

        // Verifica se o utilizador já resgatou este código específico
        const resgateExistente = await ResgateUsuario.findOne({
            where: {
                usuarioId: usuario.id,
                codigoDiarioId: codigoDiario.id
            }
        }, { transaction: t });

        if (resgateExistente) {
            await t.rollback();
            return res.status(400).send({ message: 'Este código já foi resgatado por você.' });
        }

    // Procede com o resgate
    const pontosGanhos = codigoDiario.pontosValor;

        const resgate = await ResgateUsuario.create({
            usuarioId: usuario.id,
            codigoDiarioId: codigoDiario.id
        }, { transaction: t });

        await TransacaoPontos.create({
            usuarioId: usuario.id,
            tipoTransacao: 'GANHO_CODIGO',
            pontos: pontosGanhos,
            descricao: `Resgate de código do ponto de coleta #${codigoDiario.pontoColetaId}`,
            referenciaId: resgate.id,
        }, { transaction: t });

        await t.commit();
        
        return res.status(200).send({
            message: `Parabéns! Você ganhou ${pontosGanhos} pontos.`,
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).send({ message: error.message });
    }
};

const listarTransacoesPontos = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const transacoes = await TransacaoPontos.findAll({
            where: { usuarioId },
            order: [['data_transacao', 'DESC']]
        });
        return res.status(200).send({ data: transacoes });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

// Retorna saldo calculado dinamicamente (soma das transações)
const saldo = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) return res.status(404).send({ message: 'Usuário não encontrado.' });
        const valor = await calcularSaldoPontos(usuarioId);
        return res.status(200).send({ saldo: valor });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const listarVouchersResgatados = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const vouchersResgatados = await UsuarioVoucher.findAll({
            where: { usuarioId },
            include: [{ model: Voucher, as: 'voucher' }],
            order: [['data_resgate', 'DESC']]
        });
        return res.status(200).send({ data: vouchersResgatados });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const listarCampanhasApoiadas = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const usuario = await Usuario.findByPk(usuarioId, {
            include: [{ model: Campanha, as: 'campanhasApoiadas', through: { attributes: [] } }]
        });
        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }
        return res.status(200).send({ data: usuario.campanhasApoiadas || [] });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

// Retorna o usuário autenticado (via JWT)
const me = async (req, res) => {
    try {
        const authUser = req.usuario;
        if (!authUser?.id) {
            return res.status(401).send({ message: 'Não autenticado.' });
        }
        const usuario = await Usuario.findOne({
            where: { id: authUser.id },
            attributes: { exclude: ['senhaHash'] }
        });
        if (!usuario) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        const saldo = await calcularSaldoPontos(usuario.id);

        return res.status(200).send({ 
            data: {
                ...usuario.toJSON(),
                saldoPontos: saldo
            }
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

export default {
    get,
    persist,
    destroy,
    addEndereco,
    listEnderecos,
    updateEndereco,
    destroyEndereco,
    resgatarVoucher,
    apoiarCampanha,
    deixarCampanha,
    recuperacaoSenha,
    redefinirSenha,
    resgatarCodigoDiario,     
    listarTransacoesPontos,   
    listarVouchersResgatados,
    listarCampanhasApoiadas,
    me,
    saldo,
}
