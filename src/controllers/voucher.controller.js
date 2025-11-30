import Voucher from "../models/Voucher.model.js";

const create = async (corpo) => {
    try {
        const {
            nomeParceiro,
            titulo,
            descricao,
            custoPontos,
            validade,
            quantidadeDisponivel,
            cadastradoPeloAdminId,
            imagem
        } = corpo;

        const response = await Voucher.create({
            nomeParceiro,
            titulo,
            descricao,
            custoPontos,
            validade,
            quantidadeDisponivel,
            cadastradoPeloAdminId,
            imagem
        });

        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async (corpo, id) => {
    try {
        const response = await Voucher.findOne({
            where: { id }
        });

        if (!response) {
            throw new Error('Voucher não encontrado para atualização.');
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
            const response = await Voucher.findAll({
                order: [['id', 'desc']],
            });

            return res.status(200).send({
                message: `${response.length} vouchers encontrados.`,
                data: response,
            });
        }

        const response = await Voucher.findOne({
            where: { id }
        });

        if (!response) {
            return res.status(404).send('Voucher não encontrado.');
        }

        return res.status(200).send({
            message: 'Voucher encontrado.',
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
        
        const data = { ...req.body };
        if (req.file) {
            data.imagem = `/uploads/${req.file.filename}`;
        }

        if (!id) {
            const response = await create(data);
            return res.status(201).send({
                message: 'Voucher criado com sucesso.',
                data: response
            });
        }

        const response = await update(data, id);
        return res.status(200).send({
            message: 'Voucher atualizado com sucesso.',
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
            return res.status(400).send('Por favor, informe o ID do voucher a ser deletado.');
        }

        const response = await Voucher.findOne({ where: { id } });

        if (!response) {
            return res.status(404).send('Voucher não encontrado.');
        }
        await response.destroy();

        return res.status(200).send({
            message: 'Voucher deletado com sucesso.',
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
