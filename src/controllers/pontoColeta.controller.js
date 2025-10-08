import { sequelize } from "../config/postgres.js";
import PontoColeta from "../models/PontoColeta.model.js";
import Endereco from "../models/Endereco.model.js";
import Empresa from "../models/Empresa.model.js";

const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { empresaId } = req.params;
        const { nomePonto, horarioFuncionamento, ativo, endereco } = req.body;

        const empresa = await Empresa.findByPk(empresaId);
        if (!empresa) {
            return res.status(404).send({ message: 'Empresa não encontrada.' });
        }

        const novoEndereco = await Endereco.create(endereco, { transaction: t });

        const novoPontoColeta = await PontoColeta.create({
            nomePonto,
            horarioFuncionamento,
            ativo,
            empresaId: empresa.id,
            enderecoId: novoEndereco.id,
        }, { transaction: t });
        
        await t.commit();

        return res.status(201).send({
            message: 'Ponto de coleta criado com sucesso!',
            data: novoPontoColeta,
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).send({ message: error.message });
    }
};

const get = async (req, res) => {
    try {
        const { empresaId, pontoColetaId } = req.params;

        if (!pontoColetaId) {
            const pontosColeta = await PontoColeta.findAll({
                where: { empresaId },
                include: [{ model: Endereco, as: 'endereco' }]
            });
            return res.status(200).send({
                message: `Encontrados ${pontosColeta.length} pontos de coleta.`,
                data: pontosColeta,
            });
        }

        const pontoColeta = await PontoColeta.findOne({
            where: { id: pontoColetaId, empresaId },
            include: [{ model: Endereco, as: 'endereco' }]
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
            if (item !== 'endereco') pontoColeta[item] = corpo[item];
        });
        await pontoColeta.save({ transaction: t });

        await t.commit();
        return pontoColeta;

    } catch (error) {
        await t.rollback();
        throw new Error(error.message);
    }
};

export default {
    get,
    persist,
    destroy,
};
