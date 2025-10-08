import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import PontoColeta from "./PontoColeta.model.js";
import TipoResiduo from "./TipoResiduo.model.js";

const PontoColetaAceitaResiduo = sequelize.define(
    'pontocoleta_aceita_residuo',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

PontoColeta.belongsToMany(TipoResiduo, {
    through: PontoColetaAceitaResiduo,
    as: 'residuosNoPonto', 
    foreignKey: {
        name: 'pontoColetaId',
        field: 'ponto_coleta_id'
    }
});

TipoResiduo.belongsToMany(PontoColeta, {
    through: PontoColetaAceitaResiduo,
    as: 'pontosDeColetaQueAceitam', 
    foreignKey: {
        name: 'tipoResiduoId',
        field: 'tipo_residuo_id'
    }
});

export default PontoColetaAceitaResiduo;
