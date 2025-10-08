import { sequelize } from "../config/postgres.js";
import AgendamentoColeta from "../models/AgendamentoColeta.model.js";
import ItemAgendamento from "../models/ItemAgendamento.model.js";
import Usuario from "../models/Usuario.model.js";
import Empresa from "../models/Empresa.model.js";
import Endereco from "../models/Endereco.model.js";
import TipoResiduo from "../models/TipoResiduo.model.js";

const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { usuarioId, empresaId, enderecoColetaId, itens, ...dadosAgendamento } = req.body;

        if (!usuarioId || !empresaId || !enderecoColetaId || !itens || itens.length === 0) {
            return res.status(400).send({ message: "Dados essenciais para o agendamento estão faltando." });
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
            message: 'Solicitação de agendamento criada com sucesso!',
            data: novoAgendamento,
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).send({ message: error.message });
    }
};

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

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, dataAgendada, justificativaRejeicao } = req.body;

        const agendamento = await AgendamentoColeta.findByPk(id);
        if (!agendamento) {
            return res.status(404).send({ message: 'Agendamento não encontrado.' });
        }

        agendamento.status = status;
        if (dataAgendada) agendamento.dataAgendada = dataAgendada;
        if (justificativaRejeicao) agendamento.justificativaRejeicao = justificativaRejeicao;

        await agendamento.save();

        // Aqui, em uma aplicação real, você dispararia uma notificação para o usuário.

        return res.status(200).send({
            message: `Status do agendamento atualizado para ${status}.`,
            data: agendamento
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const agendamento = await AgendamentoColeta.findByPk(id);
        if (!agendamento) {
            return res.status(404).send({ message: 'Agendamento não encontrado.' });
        }

        await agendamento.destroy();
        return res.status(200).send({ message: 'Agendamento deletado com sucesso.' });

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
