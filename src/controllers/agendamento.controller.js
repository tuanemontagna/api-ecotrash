import { sequelize } from "../config/postgres.js";
import AgendamentoColeta from "../models/AgendamentoColeta.model.js";
import ItemAgendamento from "../models/ItemAgendamento.model.js";
import Usuario from "../models/Usuario.model.js";
import Empresa from "../models/Empresa.model.js";
import Endereco from "../models/Endereco.model.js";
import TipoResiduo from "../models/TipoResiduo.model.js";
import TransacaoPontos from "../models/TransacaoPontos.model.js";

const PONTOS_POR_COLETA_CONCLUIDA = 100;

// Função para um utilizador criar um novo pedido de agendamento
const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { usuarioId, empresaId, enderecoColetaId, itens, ...dadosAgendamento } = req.body;

        if (!usuarioId || !empresaId || !enderecoColetaId || !itens || itens.length === 0) {
            return res.status(400).send({ message: "Dados essenciais para o agendamento em falta." });
        }

        const novoAgendamento = await AgendamentoColeta.create({
            usuarioId,
            empresaId,
            enderecoColetaId,
            ...dadosAgendamento,
            status: 'SOLICITADO',
        }, { transaction: t });

        const itensParaCriar = itens.map(item => ({
            ...item,
            agendamentoId: novoAgendamento.id
        }));
        await ItemAgendamento.bulkCreate(itensParaCriar, { transaction: t });

        await t.commit();

        return res.status(201).send({
            message: 'Pedido de agendamento criado com sucesso!',
            data: novoAgendamento,
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).send({ message: error.message });
    }
};

// Função para procurar um agendamento específico por ID
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const agendamento = await AgendamentoColeta.findByPk(id, {
            include: [
                { model: Usuario, as: 'solicitante', attributes: ['id', 'nome', 'email'] },
                { model: Empresa, as: 'empresaResponsavel' },
                { model: Endereco, as: 'enderecoColeta' },
                {
                    model: ItemAgendamento,
                    as: 'itens',
                    include: [{ model: TipoResiduo, as: 'tipoResiduo' }]
                }
            ]
        });

        if (!agendamento) {
            return res.status(404).send({ message: 'Agendamento não encontrado.' });
        }
        return res.status(200).send({ message: 'Agendamento encontrado.', data: agendamento });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

// Função para listar agendamentos de um utilizador específico
const listByUser = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const agendamentos = await AgendamentoColeta.findAll({
            where: { usuarioId },
            order: [['data_solicitacao', 'DESC']],
            include: [{ model: Empresa, as: 'empresaResponsavel', attributes: ['id', 'nomeFantasia'] }]
        });
        return res.status(200).send({ data: agendamentos });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

// Função para listar agendamentos recebidos por uma empresa
const listByEmpresa = async (req, res) => {
    try {
        const { empresaId } = req.params;
        const agendamentos = await AgendamentoColeta.findAll({
            where: { empresaId },
            order: [['data_solicitacao', 'DESC']],
            include: [{ model: Usuario, as: 'solicitante', attributes: ['id', 'nome'] }]
        });
        return res.status(200).send({ data: agendamentos });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

// Função para uma empresa atualizar o estado de um agendamento
const updateStatus = async (req, res) => {
    const t = await sequelize.transaction(); // Inicia uma transação
    try {
        const { id } = req.params;
        const { status, dataAgendada, justificativaRejeicao } = req.body;

        const agendamento = await AgendamentoColeta.findByPk(id, { transaction: t });
        if (!agendamento) {
            await t.rollback();
            return res.status(404).send({ message: 'Agendamento não encontrado.' });
        }

        const statusAnterior = agendamento.status;
        agendamento.status = status;
        if (dataAgendada) agendamento.dataAgendada = dataAgendada;
        if (justificativaRejeicao) agendamento.justificativaRejeicao = justificativaRejeicao;

        // LÓGICA DE NEGÓCIO ADICIONAL: Atribuição de pontos
        if (status === 'CONCLUIDO' && statusAnterior !== 'CONCLUIDO') {
            const usuario = await Usuario.findByPk(agendamento.usuarioId, { transaction: t });
            if (usuario) {
                // 1. Atualiza o saldo do utilizador
                usuario.saldoPontos += PONTOS_POR_COLETA_CONCLUIDA;
                await usuario.save({ transaction: t });

                // 2. Cria o registo no histórico de transações
                await TransacaoPontos.create({
                    usuarioId: usuario.id,
                    tipoTransacao: 'GANHO_COLETA',
                    pontos: PONTOS_POR_COLETA_CONCLUIDA,
                    descricao: `Pontos recebidos pela coleta #${agendamento.id}`,
                    referenciaId: agendamento.id,
                }, { transaction: t });
            }
        }

        await agendamento.save({ transaction: t });
        await t.commit(); // Confirma a transação se tudo correu bem

        // Futuramente, aqui também será disparada uma notificação para o utilizador.

        return res.status(200).send({
            message: `Estado do agendamento atualizado para ${status}.`,
            data: agendamento
        });

    } catch (error) {
        await t.rollback(); // Desfaz a transação em caso de erro
        return res.status(500).send({ message: error.message });
    }
};

// Função para apagar um agendamento
const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const agendamento = await AgendamentoColeta.findByPk(id);
        if (!agendamento) {
            return res.status(404).send({ message: 'Agendamento não encontrado.' });
        }

        await agendamento.destroy();
        return res.status(200).send({ message: 'Agendamento apagado com sucesso.' });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

export default {
    create,
    getById,
    listByUser,
    listByEmpresa,
    updateStatus,
    destroy,
};

