import Campanha from "../models/Campanha.model.js";
import Empresa from "../models/Empresa.model.js";
import PontoColeta from "../models/PontoColeta.model.js";
import { sequelize } from "../config/postgres.js";

const create = async (corpo) => {
    try {
        const {
            titulo,
            descricao,
            dataInicio,
            dataFim,
            ativa,
            pontosPorAdesao
        } = corpo;

        const response = await Campanha.create({
            titulo,
            descricao,
            dataInicio,
            dataFim,
            ativa,
            pontosPorAdesao
        });

        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async (corpo, id) => {
    try {
        const response = await Campanha.findOne({
            where: { id }
        });

        if (!response) {
            throw new Error('Campanha não encontrada para atualização.');
        }

        Object.keys(corpo).forEach((item) => response[item] = corpo[item]);
        await response.save();
        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            const response = await Campanha.findAll({
                order: [['id', 'desc']],
            });

            return res.status(200).send({
                message: `${response.length} campanhas encontradas.`,
                data: response,
            });
        }

        const response = await Campanha.findOne({
            where: { id },
            include: [ 
                { model: Empresa, as: 'empresasParceiras', through: { attributes: [] } },
                { model: PontoColeta, as: 'pontosDeColetaAssociados', through: { attributes: [] } }
            ]
        });

        if (!response) {
            return res.status(404).send('Campanha não encontrada.');
        }

        return res.status(200).send({
            message: 'Campanha encontrada.',
            data: response,
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
                message: 'Campanha criada com sucesso.',
                data: response
            });
        }

        const response = await update(req.body, id);
        return res.status(200).send({
            message: 'Campanha atualizada com sucesso.',
            data: response
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

const destroy = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            return res.status(400).send('Por favor, informe o ID da campanha a ser deletada.');
        }

        const response = await Campanha.findOne({ where: { id } });

        if (!response) {
            return res.status(404).send('Campanha não encontrada.');
        }
        await response.destroy();

        return res.status(200).send({
            message: 'Campanha deletada com sucesso.',
            data: response
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

const addEmpresa = async (req, res) => {
    try {
        const { campanhaId } = req.params;
        const { empresaId } = req.body;

        const campanha = await Campanha.findByPk(campanhaId);
        const empresa = await Empresa.findByPk(empresaId);

        if (!campanha || !empresa) {
            return res.status(404).send({ message: 'Campanha ou Empresa não encontrada.' });
        }

        await campanha.addEmpresasParceira(empresa);

        return res.status(200).send({ message: 'Empresa associada à campanha com sucesso.' });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const addPontoColeta = async (req, res) => {
    try {
        const { campanhaId } = req.params;
        const { pontoColetaId } = req.body;

        const campanha = await Campanha.findByPk(campanhaId);
        const pontoColeta = await PontoColeta.findByPk(pontoColetaId);

        if (!campanha || !pontoColeta) {
            return res.status(404).send({ message: 'Campanha ou Ponto de Coleta não encontrado.' });
        }

        await campanha.addPontosDeColetaAssociado(pontoColeta);

        return res.status(200).send({ message: 'Ponto de Coleta associado à campanha com sucesso.' });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};


export default {
    get,
    persist,
    destroy,
    addEmpresa,
    addPontoColeta,
}
