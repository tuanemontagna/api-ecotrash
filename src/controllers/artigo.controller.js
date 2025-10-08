import Artigo from "../models/Artigo.model.js";

const create = async (corpo) => {
    try {
        const {
            titulo,
            conteudo,
            publicado,
            autorId 
        } = corpo;

        if (!titulo || !conteudo) {
            throw new Error("Título e conteúdo são campos obrigatórios.");
        }

        const response = await Artigo.create({
            titulo,
            conteudo,
            publicado,
            autorId
        });

        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async (corpo, id) => {
    try {
        const response = await Artigo.findOne({
            where: { id }
        });

        if (!response) {
            throw new Error('Artigo não encontrado para atualização.');
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
            const response = await Artigo.findAll({
                order: [['data_publicacao', 'DESC']], 
            });

            return res.status(200).send({
                message: `${response.length} artigos encontrados.`,
                data: response,
            });
        }

        const response = await Artigo.findOne({
            where: { id }
        });

        if (!response) {
            return res.status(404).send('Artigo não encontrado.');
        }

        return res.status(200).send({
            message: 'Artigo encontrado.',
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
                message: 'Artigo criado com sucesso.',
                data: response
            });
        }

        const response = await update(req.body, id);
        return res.status(200).send({
            message: 'Artigo atualizado com sucesso.',
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
            return res.status(400).send('Por favor, informe o ID do artigo a ser deletado.');
        }

        const response = await Artigo.findOne({ where: { id } });

        if (!response) {
            return res.status(404).send('Artigo não encontrado.');
        }
        await response.destroy();

        return res.status(200).send({
            message: 'Artigo deletado com sucesso.',
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
