import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";

const Voucher = sequelize.define(
    'vouchers',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nomeParceiro: {
            field: 'nome_parceiro',
            type: DataTypes.STRING,
            allowNull: false,
        },
        titulo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        custoPontos: {
            field: 'custo_pontos',
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        validade: {
            type: DataTypes.DATEONLY, 
            allowNull: true,
        },
        quantidadeDisponivel: {
            field: 'quantidade_disponivel',
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        imagem: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

Voucher.belongsTo(Usuario, {
    as: 'adminCriador', 
    onUpdate: 'NO ACTION',
    onDelete: 'SET NULL', 
    foreignKey: {
        name: 'cadastradoPeloAdminId',
        field: 'cadastrado_pelo_admin_id',
        allowNull: true, 
    }
});

export default Voucher;
