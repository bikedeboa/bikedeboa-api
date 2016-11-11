'use strict';
module.exports = function(sequelize, DataTypes) {
    var Review = sequelize.define('Review', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING
        },
        rating: {
            type: DataTypes.INTEGER
        },
        hour: {
            type: DataTypes.TIME,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                // associations can be defined here
                Review.belongsToMany(models.Tag, {through: 'Review_Tags', foreignKey: 'review_id', otherKey: 'tag_id', hooks: true});
            }
        }
    });
    return Review;
};