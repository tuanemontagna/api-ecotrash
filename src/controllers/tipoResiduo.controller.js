import TipoResiduo from "../models/TipoResiduo.model.js";

const create = async (corpo) => {
    try {
        const { nome, descricao } = corpo;

        if (!nome) {
            throw new Error("O nome do tipo de resíduo é obrigatório.");
        }

        const response = await TipoResiduo.create({
            nome,
            descricao,
        });

        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async (corpo, id) => {
    try {
        const response = await TipoResiduo.findOne({
            where: { id }
        });

        if (!response) {
            throw new Error('Tipo de resíduo não encontrado para atualização.');
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
            const response = await TipoResiduo.findAll({
                order: [['nome', 'ASC']],
            });

            return res.status(200).send({
                message: `${response.length} tipos de resíduos encontrados.`,
                data: response,
            });
        }

        const response = await TipoResiduo.findOne({
            where: { id }
        });

        if (!response) {
            return res.status(404).send('Tipo de resíduo não encontrado.');
        }

        return res.status(200).send({
            message: 'Tipo de resíduo encontrado.',
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
                message: 'Tipo de resíduo criado com sucesso.',
                data: response
            });
        }

        const response = await update(req.body, id);
        return res.status(200).send({
            message: 'Tipo de resíduo atualizado com sucesso.',
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
            return res.status(400).send('Por favor, informe o ID do tipo de resíduo a ser apagado.');
        }

        const response = await TipoResiduo.findOne({ where: { id } });

        if (!response) {
            return res.status(404).send('Tipo de resíduo não encontrado.');
        }
        await response.destroy();

        return res.status(200).send({
            message: 'Tipo de resíduo apagado com sucesso.',
            data: response
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

export default {
    get,
    persist,
    destroy,
}
