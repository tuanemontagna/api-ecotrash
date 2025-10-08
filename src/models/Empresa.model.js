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
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

Empresa.belongsTo(Usuario, {
    as: 'usuario',
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT', 
    foreignKey: {
        name: 'usuarioId',
        field: 'usuario_id',
        allowNull: false,
        unique: true,
    }
});

Empresa.belongsTo(Endereco, {
    as: 'endereco',
    onUpdate: 'NO ACTION',
    onDelete: 'SET NULL', 
    foreignKey: {
        name: 'enderecoId',
        field: 'endereco_id',
        allowNull: true,
    }
});

export default Empresa;
