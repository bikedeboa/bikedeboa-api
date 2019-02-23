'use strict';
module.exports = (sequelize, DataTypes) => {
  const support = sequelize.define('support', {
    user_id: DataTypes.INTEGER,
    requestLocal_id: DataTypes.INTEGER
  }, {});
  support.associate = function(models) {
    // associations can be defined here
	support.belongsTo(models.RequestLocal, {foreignKey: 'requestLocal_id', hooks: true});
	support.belongsTo(models.User, {foreignKey: 'user_id', hooks: true});
  };
  return support;
};