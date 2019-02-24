'use strict';
module.exports = (sequelize, DataTypes) => {
  const Support = sequelize.define('Support', {
    user_id: DataTypes.INTEGER,
    requestLocal_id: DataTypes.INTEGER
  }, {});
  Support.associate = function(models) {
    // associations can be defined here
	Support.belongsTo(models.RequestLocal, {foreignKey: 'requestLocal_id', hooks: true});
	Support.belongsTo(models.User, {foreignKey: 'user_id', hooks: true});
  };
  console.log(Support);
  return Support;
};