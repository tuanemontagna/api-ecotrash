import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import AgendamentoColeta from "./AgendamentoColeta.model.js";
import TipoResiduo from "./TipoResiduo.model.js";

const ItemAgendamento = sequelize.define(
    'itens_agendamento',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        quantidade: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

ItemAgendamento.belongsTo(AgendamentoColeta, {
    as: 'agendamento',
    foreignKey: {
        name: 'agendamentoId',
        field: 'agendamento_id',
        allowNull: false,
    }
});

AgendamentoColeta.hasMany(ItemAgendamento, {
    as: 'itens',
    foreignKey: {
        name: 'agendamentoId',
        field: 'agendamento_id',
    }
});

ItemAgendamento.belongsTo(TipoResiduo, {
    as: 'tipoResiduo',
    foreignKey: {
        name: 'tipoResiduoId',
        field: 'tipo_residuo_id',
        allowNull: false,
    }
});

export default ItemAgendamento;
