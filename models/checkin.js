'use strict';
module.exports = function(sequelize, DataTypes) {
    var Checkin = sequelize.define('Checkin', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        hour: {
            type: DataTypes.TIME,
            allowNull: false
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });
    return Checkin;
};