'use strict';
module.exports = function(sequelize, DataTypes) {
    var Local = sequelize.define('Local', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lat: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lng: {
            type: DataTypes.STRING,
            allowNull: false
        },
        structureType: {
            type: DataTypes.STRING
        },
        isPublic: {
            type: DataTypes.BOOLEAN
        },
        text: {
            type: DataTypes.TEXT
        },
        photo: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        address: {
            type: DataTypes.TEXT
        },
    }, {
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                Local.belongsToMany(models.Tag, {through: 'Local_Tags', foreignKey: 'local_id', otherKey: 'tag_id', hooks: true});
                Local.hasMany(models.Review, {foreignKey: 'local_id', onDelete: 'cascade', hooks: true});
                Local.hasOne(models.Checkin, {foreignKey: 'local_id', onDelete: 'cascade', hooks: true});
            }
        },
        instanceMethods: {
        }
    });
    return Local;
};