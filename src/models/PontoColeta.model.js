import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Empresa from "./Empresa.model.js";
import Endereco from "./Endereco.model.js";
import TipoResiduo from "./TipoResiduo.model.js";

const PontoColeta = sequelize.define(
    'pontos_coleta',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nomePonto: {
            field: 'nome_ponto',
            type: DataTypes.STRING,
            allowNull: false,
        },
        horarioFuncionamento: {
            field: 'horario_funcionamento',
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);


PontoColeta.belongsTo(Empresa, {
    as: 'empresa',
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE', 
    foreignKey: {
        name: 'empresaId',
        field: 'empresa_id',
        allowNull: false,
    }
});

Empresa.hasMany(PontoColeta, {
    as: 'pontosDeColeta',
    foreignKey: {
        name: 'empresaId',
        field: 'empresa_id'
    }
});


PontoColeta.belongsTo(Endereco, {
    as: 'endereco',
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT', 
    foreignKey: {
        name: 'enderecoId',
        field: 'endereco_id',
        allowNull: false,
        unique: true,
    }
});

PontoColeta.belongsToMany(TipoResiduo, {
    through: 'pontocoleta_aceita_residuo',
    as: 'tiposResiduosAceitos',
    foreignKey: {
        name: 'pontoColetaId',
        field: 'ponto_coleta_id'
    },
    otherKey: {
        name: 'tipoResiduoId',
        field: 'tipo_residuo_id'
    },
    timestamps: false,
});

TipoResiduo.belongsToMany(PontoColeta, {
    through: 'pontocoleta_aceita_residuo',
    as: 'pontosDeColeta',
    foreignKey: {
        name: 'tipoResiduoId',
        field: 'tipo_residuo_id'
    },
    otherKey: {
        name: 'pontoColetaId',
        field: 'ponto_coleta_id'
    },
    timestamps: false,
});


export default PontoColeta;
