'use strict';
module.exports = function(sequelize, DataTypes) {
    var Tag = sequelize.define('Tag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                Tag.belongsToMany(models.Local, {through: 'Local_Tags', foreignKey: 'tag_id', otherKey: 'local_id', hooks: true});
            }
        }
    });
    return Tag;
};