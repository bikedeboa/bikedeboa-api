'use strict';
module.exports = function(sequelize, DataTypes) {
    var Log = sequelize.define('Log', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        endpoint: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true,
        freezeTableName: true
    });
    return Log;
};
