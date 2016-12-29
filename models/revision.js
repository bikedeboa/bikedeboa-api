'use strict';
module.exports = function(sequelize, DataTypes) {
    var Revision = sequelize.define('Revision', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        comments: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                Revision.belongsTo(models.Local, {foreignKey: 'local_id', hooks: true});
            }
        }
    });
    return Revision;
};
