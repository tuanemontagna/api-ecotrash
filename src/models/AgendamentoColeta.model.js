import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Usuario from "./Usuario.model.js";
import Empresa from "./Empresa.model.js";
import Endereco from "./Endereco.model.js";

const AgendamentoColeta = sequelize.define(
    'agendamentos_coleta',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        dataAgendada: {
            field: 'data_agendada',
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'SOLICITADO',
        },
        volumeEstimadoM3: {
            field: 'volume_estimado_m3',
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        pesoEstimadoKg: {
            field: 'peso_estimado_kg',
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        observacoesUsuario: {
            field: 'observacoes_usuario',
            type: DataTypes.TEXT,
            allowNull: true,
        },
        justificativaRejeicao: {
            field: 'justificativa_rejeicao',
            type: DataTypes.TEXT,
            allowNull: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'data_solicitacao',
        updatedAt: 'updated_at',
    }
);


AgendamentoColeta.belongsTo(Usuario, {
    as: 'solicitante',
    foreignKey: {
        name: 'usuarioId',
        field: 'usuario_id',
        allowNull: false,
    }
});

AgendamentoColeta.belongsTo(Empresa, {
    as: 'empresaResponsavel',
    foreignKey: {
        name: 'empresaId',
        field: 'empresa_id',
        allowNull: false,
    }
});

AgendamentoColeta.belongsTo(Endereco, {
    as: 'enderecoColeta',
    foreignKey: {
        name: 'enderecoColetaId',
        field: 'endereco_coleta_id',
        allowNull: false,
    }
});

export default AgendamentoColeta;
