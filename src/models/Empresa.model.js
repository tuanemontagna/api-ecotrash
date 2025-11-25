import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";
import Endereco from "./Endereco.model.js";

const Empresa = sequelize.define(
    'empresas',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        razaoSocial: {
            field: 'razao_social',
            type: DataTypes.STRING,
            allowNull: false,
        },
        nomeFantasia: {
            field: 'nome_fantasia',
            type: DataTypes.STRING,
            allowNull: true,
        },
        cnpj: {
            type: DataTypes.STRING(18),
            allowNull: false,
            unique: true,
        },
        aprovadaPeloAdmin: {
            field: 'aprovada_pelo_admin',
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        usuarioId: {
            field: 'usuario_id',
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        enderecoId: {
            field: 'endereco_id',
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

Empresa.belongsTo(Usuario, {
    as: 'usuario',
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT', 
    foreignKey: 'usuarioId'
});

Empresa.belongsTo(Endereco, {
    as: 'endereco',
    onUpdate: 'NO ACTION',
    onDelete: 'SET NULL', 
    foreignKey: 'enderecoId'
});

Endereco.hasOne(Empresa, {
    as: 'empresa',
    foreignKey: {
        name: 'enderecoId',
        field: 'endereco_id'
    }
});

export default Empresa;
