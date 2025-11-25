import { sequelize } from "../config/postgres.js";
import PontoColeta from "../models/PontoColeta.model.js";
import Endereco from "../models/Endereco.model.js";
import Empresa from "../models/Empresa.model.js";
import TipoResiduo from "../models/TipoResiduo.model.js";
import CodigoDiarioPontoColeta from "../models/CodigoDiarioPontoColeta.model.js";

const create = async (corpo, empresaId) => {
    const t = await sequelize.transaction();
    try {
        const { nomePonto, horarioFuncionamento, ativo, endereco, itensAceitos } = corpo;

        const empresa = await Empresa.findByPk(empresaId);
        if (!empresa) {
            throw new Error('Empresa não encontrada.');
        }

        const novoEndereco = await Endereco.create(endereco, { transaction: t });

        const novoPontoColeta = await PontoColeta.create({
            nomePonto,
            horarioFuncionamento,
            ativo,
            empresaId: empresa.id,
            enderecoId: novoEndereco.id,
        }, { transaction: t });

        if (itensAceitos && Array.isArray(itensAceitos)) {
            await novoPontoColeta.setTiposResiduosAceitos(itensAceitos, { transaction: t });
        }
        
        await t.commit();

        return novoPontoColeta;

    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const get = async (req, res) => {
    try {
        const { empresaId, pontoColetaId } = req.params;

        if (!pontoColetaId) {
            const pontosColeta = await PontoColeta.findAll({
                where: { empresaId },
                include: [
                    { model: Endereco, as: 'endereco' },
                    { model: TipoResiduo, as: 'tiposResiduosAceitos' }
                ]
            });
            return res.status(200).send({
                message: `Encontrados ${pontosColeta.length} pontos de coleta.`,
                data: pontosColeta,
            });
        }

        const pontoColeta = await PontoColeta.findOne({
            where: { id: pontoColetaId, empresaId },
            include: [
                { model: Endereco, as: 'endereco' },
                { model: TipoResiduo, as: 'tiposResiduosAceitos' }
            ]
        });

        if (!pontoColeta) {
            return res.status(404).send('Ponto de coleta não encontrado.');
        }

        return res.status(200).send({
            message: 'Ponto de coleta encontrado.',
            data: pontoColeta
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const persist = async (req, res) => {
    try {
        const { empresaId, pontoColetaId } = req.params;
        
        if (!pontoColetaId) {
            const response = await create(req.body, empresaId);
            return res.status(201).send({
                message: 'Ponto de coleta criado com sucesso!',
                data: response
            });
        }

        const response = await update(req.body, pontoColetaId, empresaId);
        return res.status(200).send({
            message: 'Ponto de coleta atualizado com sucesso!',
            data: response
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { empresaId, pontoColetaId } = req.params;

        const pontoColeta = await PontoColeta.findOne({
            where: { id: pontoColetaId, empresaId }
        });

        if (!pontoColeta) {
            return res.status(404).send('Ponto de coleta não encontrado ou não pertence a esta empresa.');
        }

        await pontoColeta.destroy();

        return res.status(200).send({ message: 'Ponto de coleta deletado com sucesso.' });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const update = async (corpo, pontoColetaId, empresaId) => {
    const t = await sequelize.transaction();
    try {
        const pontoColeta = await PontoColeta.findOne({
            where: { id: pontoColetaId, empresaId: empresaId }
        });

        if (!pontoColeta) {
            throw new Error('Ponto de coleta não encontrado ou não pertence a esta empresa.');
        }

        // Atualiza os dados do endereço se forem fornecidos
        if (corpo.endereco) {
            const endereco = await Endereco.findByPk(pontoColeta.enderecoId);
            if (endereco) {
                Object.keys(corpo.endereco).forEach(item => endereco[item] = corpo.endereco[item]);
                await endereco.save({ transaction: t });
            }
        }

        Object.keys(corpo).forEach(item => {
            if (item !== 'endereco' && item !== 'itensAceitos') pontoColeta[item] = corpo[item];
        });
        await pontoColeta.save({ transaction: t });

        if (corpo.itensAceitos && Array.isArray(corpo.itensAceitos)) {
            await pontoColeta.setTiposResiduosAceitos(corpo.itensAceitos, { transaction: t });
        }

        await t.commit();
        return pontoColeta;

    } catch (error) {
        await t.rollback();
        throw new Error(error.message);
    }
};

const getCodigoDiario = async (req, res) => {
    try {
        const { empresaId, pontoColetaId } = req.params;

        const pontoColeta = await PontoColeta.findOne({
            where: { id: pontoColetaId, empresaId }
        });

        if (!pontoColeta) {
            return res.status(404).send({ message: 'Ponto de coleta não encontrado ou não pertence a esta empresa.' });
        }

        const hoje = new Date().toISOString().slice(0, 10);
        console.log(`Buscando código para ponto ${pontoColeta.id} na data ${hoje}`); // DEBUG
        let codigo = await CodigoDiarioPontoColeta.findOne({
            where: {
                pontoColetaId: pontoColeta.id,
                dataValidade: hoje
            }
        });

        if (!codigo) {
            // Fallback: Gera código se não existir (Lazy Generation)
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let newCode = 'ECO-';
            for (let i = 0; i < 4; i++) newCode += chars.charAt(Math.floor(Math.random() * chars.length));
            
            codigo = await CodigoDiarioPontoColeta.create({
                pontoColetaId: pontoColeta.id,
                codigo: newCode,
                dataValidade: hoje,
                pontosValor: 50
            });
        }

        return res.status(200).send({
            message: 'Código encontrado.',
            data: codigo
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

export default {
    get,
    persist,
    destroy,
    getCodigoDiario,
};
