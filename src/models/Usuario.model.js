import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js"; 

const Usuario = sequelize.define(
    'usuarios',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        senhaHash: {
            field: 'senha_hash',
            type: DataTypes.STRING,
            allowNull: false,
        },
        telefone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tipoUsuario: {
            field: 'tipo_usuario',
            type: DataTypes.ENUM('PESSOA_FISICA', 'EMPRESA', 'ADMIN'),
            allowNull: false,
        },
        cpf: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        saldoPontos: {
            field: 'saldo_pontos',
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default Usuario;
