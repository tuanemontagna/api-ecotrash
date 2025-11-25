import Endereco from "../models/Endereco.model.js";
import Usuario from "../models/Usuario.model.js";
import Empresa from "../models/Empresa.model.js";

const getAll = async (req, res) => {
    try {
        const enderecos = await Endereco.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'usuarios',
                    attributes: ['id', 'nome', 'email'],
                    through: { attributes: [] }
                },
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['id', 'razaoSocial', 'nomeFantasia']
                }
            ],
            order: [['id', 'DESC']]
        });
        return res.status(200).send({
            message: `${enderecos.length} endereços encontrados.`,
            data: enderecos
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const endereco = await Endereco.findByPk(id);
        if (!endereco) {
            return res.status(404).send({ message: 'Endereço não encontrado.' });
        }
        return res.status(200).send({ data: endereco });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const corpo = req.body;
        const endereco = await Endereco.findByPk(id);
        
        if (!endereco) {
            return res.status(404).send({ message: 'Endereço não encontrado.' });
        }

        Object.keys(corpo).forEach((item) => (endereco[item] = corpo[item]));
        await endereco.save();

        return res.status(200).send({
            message: 'Endereço atualizado com sucesso.',
            data: endereco
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const endereco = await Endereco.findByPk(id);
        
        if (!endereco) {
            return res.status(404).send({ message: 'Endereço não encontrado.' });
        }

        await endereco.destroy();
        return res.status(200).send({ message: 'Endereço excluído com sucesso.' });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

export default {
    getAll,
    getById,
    update,
    destroy
};
