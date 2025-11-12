import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";
import Endereco from "./Endereco.model.js";

const UsuarioEndereco = sequelize.define(
    'usuario_enderecos',
    {
        usuarioId: {
            field: 'usuario_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        enderecoId: {
            field: 'endereco_id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        isPrincipal: {
            field: 'is_principal',
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        apelidoEndereco: {
            field: 'apelido_endereco',
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

Usuario.belongsToMany(Endereco, {
    through: UsuarioEndereco,
    as: 'enderecos',
    foreignKey: {
        name: 'usuarioId',
        field: 'usuario_id'
    },
    onDelete: 'CASCADE',
});

Endereco.belongsToMany(Usuario, {
    through: UsuarioEndereco,
    as: 'usuarios',
    foreignKey: {
        name: 'enderecoId',
        field: 'endereco_id'
    },
    onDelete: 'CASCADE',
});

export default UsuarioEndereco;
