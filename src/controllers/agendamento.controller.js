import { sequelize } from "../config/postgres.js";
import AgendamentoColeta from "../models/AgendamentoColeta.model.js";
import ItemAgendamento from "../models/ItemAgendamento.model.js";
import Usuario from "../models/Usuario.model.js";
import Empresa from "../models/Empresa.model.js";
import Endereco from "../models/Endereco.model.js";
import TipoResiduo from "../models/TipoResiduo.model.js";
import TransacaoPontos from "../models/TransacaoPontos.model.js";
import { enviarEmailDeNotificacao } from "../utils/sendMail.js";

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

        // Envia notificação por e-mail para a empresa (não bloqueante)
        try {
            const empresa = await Empresa.findByPk(empresaId, {
                include: [{ model: Usuario, as: 'usuario', attributes: ['email', 'nome'] }]
            });
            const solicitante = await Usuario.findByPk(usuarioId, { attributes: ['nome'] });

            if (empresa?.usuario?.email) {
                const assunto = `Nova solicitação de coleta #${novoAgendamento.id}`;
                const dataFmt = dadosAgendamento.dataAgendada ? new Date(dadosAgendamento.dataAgendada).toLocaleString('pt-BR') : 'Data a definir';
                
                const corpo = `
                    <p>Olá, <strong>${empresa.usuario.nome || empresa.nomeFantasia || 'Empresa'}</strong>!</p>
                    <p>Você recebeu uma nova solicitação de coleta no sistema EcoTrash.</p>
                    <ul>
                        <li><strong>Solicitante:</strong> ${solicitante?.nome || 'Usuário'}</li>
                        <li><strong>Data sugerida:</strong> ${dataFmt}</li>
                        <li><strong>ID do Agendamento:</strong> #${novoAgendamento.id}</li>
                    </ul>
                    <p>Acesse seu painel para visualizar os detalhes e aprovar ou rejeitar o pedido.</p>
                `;
                await enviarEmailDeNotificacao(empresa.usuario.email, empresa.usuario.nome || 'Empresa', assunto, corpo);
            }
        } catch (e) {
            console.warn('Falha ao enviar e-mail de notificação para a empresa:', e?.message || e);
        }

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
            include: [
                { model: Empresa, as: 'empresaResponsavel', attributes: ['id', 'nomeFantasia'] },
                { 
                    model: ItemAgendamento, 
                    as: 'itens',
                    include: [{ model: TipoResiduo, as: 'tipoResiduo', attributes: ['nome'] }]
                },
                { model: Endereco, as: 'enderecoColeta' }
            ]
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
            include: [
                { model: Usuario, as: 'solicitante', attributes: ['id', 'nome'] },
                { 
                    model: ItemAgendamento, 
                    as: 'itens',
                    include: [{ model: TipoResiduo, as: 'tipoResiduo', attributes: ['nome'] }]
                },
                { model: Endereco, as: 'enderecoColeta' }
            ]
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

        // Envia notificação por e-mail ao usuário solicitante (não bloqueante)
        try {
            const usuario = await Usuario.findByPk(agendamento.usuarioId, { attributes: ['nome', 'email'] });
            if (usuario?.email) {
                let assunto = `Atualização do agendamento #${agendamento.id}`;
                let corpo = `<p>Olá, ${usuario.nome || 'usuário'}!</p>`;

                const dataFmt = agendamento.dataAgendada ? new Date(agendamento.dataAgendada).toLocaleString('pt-BR') : null;

                switch ((agendamento.status || '').toUpperCase()) {
                    case 'CONFIRMADA':
                    case 'AGENDADA':
                        assunto = `Seu agendamento #${agendamento.id} foi confirmado`;
                        corpo += `<p>Seu pedido de coleta foi confirmado${dataFmt ? ` para <strong>${dataFmt}</strong>` : ''}.</p>`;
                        break;
                    case 'REJEITADA':
                        assunto = `Seu agendamento #${agendamento.id} foi rejeitado`;
                        corpo += `<p>Infelizmente, seu pedido de coleta foi rejeitado.</p>`;
                        if (agendamento.justificativaRejeicao) {
                            corpo += `<p>Motivo: <em>${agendamento.justificativaRejeicao}</em></p>`;
                        }
                        break;
                    case 'CANCELADO':
                        assunto = `Seu agendamento #${agendamento.id} foi cancelado`;
                        corpo += `<p>O agendamento foi cancelado. Se precisar, você pode solicitar novamente quando quiser.</p>`;
                        break;
                    case 'CONCLUIDO':
                        assunto = `Coleta concluída • agendamento #${agendamento.id}`;
                        corpo += `<p>Sua coleta foi concluída com sucesso.</p>`;
                        corpo += `<p>Você ganhou <strong>${PONTOS_POR_COLETA_CONCLUIDA}</strong> pontos em sua conta.</p>`;
                        corpo += `<p>Obrigado por contribuir com a sustentabilidade!</p>`;
                        break;
                    default:
                        corpo += `<p>O status do seu agendamento foi atualizado para <strong>${agendamento.status}</strong>.</p>`;
                }

                corpo += `<p>Código do agendamento: <strong>#${agendamento.id}</strong></p>`;
                await enviarEmailDeNotificacao(usuario.email, usuario.nome || 'Usuário', assunto, corpo);
            }
        } catch (e) {
            console.warn('Falha ao enviar e-mail de notificação do agendamento:', e?.message || e);
        }

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

