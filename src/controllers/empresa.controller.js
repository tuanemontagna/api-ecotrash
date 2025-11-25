import { sequelize } from "../config/postgres.js";
import Usuario from "../models/Usuario.model.js";
import Empresa from "../models/Empresa.model.js";
import Endereco from "../models/Endereco.model.js";
import Campanha from "../models/Campanha.model.js";
import TipoResiduo from "../models/TipoResiduo.model.js";
import bcrypt from "bcrypt";

const create = async (corpo) => {
    const t = await sequelize.transaction();
    try {
        const { nome, email, senha, telefone, razaoSocial, nomeFantasia, cnpj, endereco, usuarioId } = corpo;

        if (!usuarioId && (!senha || !nome || !email)) {
             throw new Error("Dados essenciais para a criação do usuário da empresa estão faltando.");
        }
        if (!razaoSocial || !cnpj || !endereco) {
            throw new Error("Dados essenciais para a criação da empresa estão faltando.");
        }

        let usuarioFinalId;

        if (usuarioId) {
            // Check if user exists
            const usuarioExistente = await Usuario.findByPk(usuarioId, { transaction: t });
            if (!usuarioExistente) {
                throw new Error("Usuário informado não encontrado.");
            }
            usuarioFinalId = usuarioExistente.id;
        } else {
            const senhaHash = await bcrypt.hash(senha, 10);
            const novoUsuario = await Usuario.create({
                nome, email, senhaHash, telefone, tipoUsuario: 'EMPRESA'
            }, { transaction: t });
            usuarioFinalId = novoUsuario.id;
            console.log('Novo usuário criado:', novoUsuario.toJSON()); // Log para debug
        }

        const novoEndereco = await Endereco.create(endereco, { transaction: t });

        console.log('Novo endereço criado:', novoEndereco.toJSON()); // Log para debug

        console.log('Tentando criar empresa com usuarioId:', usuarioFinalId, 'e enderecoId:', novoEndereco.id); // Log para debug

        const novaEmpresa = await Empresa.create({
            razaoSocial, nomeFantasia, cnpj,
            usuarioId: usuarioFinalId,
            enderecoId: novoEndereco.id
        }, { transaction: t });

        console.log('Nova empresa criada:', novaEmpresa.toJSON()); // Log para debug

        await t.commit();
        return novaEmpresa;

    } catch (error) {
        await t.rollback();
        throw new Error(error.message);
    }
}

const update = async (corpo, id) => {
    try {
        const empresa = await Empresa.findByPk(id);
        if (!empresa) {
            throw new Error('Empresa não encontrada para atualização.');
        }

        // Atualiza os dados da empresa e opcionalmente do endereço associado
        if (corpo.endereco) {
            const endereco = await Endereco.findByPk(empresa.enderecoId);
            if (endereco) {
                Object.keys(corpo.endereco).forEach(item => endereco[item] = corpo.endereco[item]);
                await endereco.save();
            }
        }

        Object.keys(corpo).forEach(item => {
            if (item !== 'endereco') empresa[item] = corpo[item];
        });
        await empresa.save();
        return empresa;

    } catch (error) {
        throw new Error(error.message);
    }
}

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            const response = await Empresa.findAll({ order: [['id', 'desc']] });
            return res.status(200).send({
                message: `${response.length} empresas encontradas.`,
                data: response,
            });
        }

        const response = await Empresa.findByPk(id, {
            include: [
                { model: Usuario, as: 'usuario', attributes: { exclude: ['senhaHash'] } },
                { model: Endereco, as: 'endereco' },
                { model: TipoResiduo, as: 'tiposResiduosAceitos', through: { attributes: [] } },
                { model: Campanha, as: 'campanhas', through: { attributes: [] } }
            ]
        });

        if (!response) {
            return res.status(404).send('Empresa não encontrada.');
        }

        return res.status(200).send({
            message: 'Empresa encontrada.',
            data: response,
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const persist = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            const response = await create(req.body);
            return res.status(201).send({
                message: 'Empresa criada com sucesso.',
                data: response
            });
        }

        const response = await update(req.body, id);
        return res.status(200).send({
            message: 'Empresa atualizada com sucesso.',
            data: response
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const destroy = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
        if (!id) {
            return res.status(400).send('Informe o ID da empresa a ser deletada.');
        }
        
        const empresa = await Empresa.findByPk(id);
        if (!empresa) {
            return res.status(404).send('Empresa não encontrada.');
        }
        
        // Em uma transação para garantir que tudo seja deletado
        await sequelize.transaction(async (t) => {
            await empresa.destroy({ transaction: t });
            // Opcional: deletar o usuário associado também
            const usuario = await Usuario.findByPk(empresa.usuarioId);
            if (usuario) await usuario.destroy({ transaction: t });
        });

        return res.status(200).send({ message: 'Empresa deletada com sucesso.' });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const associarTipoResiduo = async (req, res) => {
    try {
        const { empresaId } = req.params;
        const { tipoResiduoId } = req.body;

        const empresa = await Empresa.findByPk(empresaId);
        const tipoResiduo = await TipoResiduo.findByPk(tipoResiduoId);

        if (!empresa || !tipoResiduo) {
            return res.status(404).send({ message: 'Empresa ou Tipo de Resíduo não encontrado.' });
        }
        await empresa.addTiposResiduosAceito(tipoResiduo);
        return res.status(200).send({ message: 'Tipo de resíduo associado com sucesso.' });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const associarCampanha = async (req, res) => {
    try {
        const { empresaId } = req.params;
        const { campanhaId } = req.body;

        const empresa = await Empresa.findByPk(empresaId);
        const campanha = await Campanha.findByPk(campanhaId);
        if (!empresa || !campanha) {
            return res.status(404).send({ message: 'Empresa ou Campanha não encontrada.' });
        }
        await empresa.addCampanha(campanha);
        return res.status(200).send({ message: 'Empresa associada à campanha com sucesso.' });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const desassociarCampanha = async (req, res) => {
    try {
        const { empresaId, campanhaId } = req.params;

        const empresa = await Empresa.findByPk(empresaId);
        const campanha = await Campanha.findByPk(campanhaId);

        if (!empresa || !campanha) {
            return res.status(404).send({ message: 'Empresa ou Campanha não encontrada.' });
        }

        await empresa.removeCampanha(campanha);
        return res.status(200).send({ message: 'Empresa removida da campanha com sucesso.' });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        console.log('Buscando empresa para usuarioId:', usuarioId); // Log para debug

        const empresa = await Empresa.findOne({
            where: { usuarioId },
            include: [
                { model: Usuario, as: 'usuario', attributes: { exclude: ['senhaHash'] } },
                { model: Endereco, as: 'endereco' },
                { model: TipoResiduo, as: 'tiposResiduosAceitos', through: { attributes: [] } },
                { model: Campanha, as: 'campanhas', through: { attributes: [] } }
            ]
        });

        if (!empresa) {
            console.log('Empresa não encontrada para usuarioId:', usuarioId); // Log para debug
            return res.status(404).send({ message: 'Nenhuma empresa associada a este usuário.' });
        }

        return res.status(200).send({
            message: 'Empresa encontrada.',
            data: empresa,
        });
    } catch (error) {
        console.error('Erro em getMe:', error); // Log para debug
        return res.status(500).send({ message: error.message });
    }
};

export default {
    get,
    getMe,
    persist,
    destroy,
    associarTipoResiduo,
    associarCampanha,
    desassociarCampanha,
}
