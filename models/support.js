'use strict';
module.exports = (sequelize, DataTypes) => {
  const Support = sequelize.define('Support', {
    user_id: 
    {
      type: DataTypes.INTEGER, 
      allowNull: false
    },
    requestLocal_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Support.associate = function(models) {
    // associations can be defined here
	Support.belongsTo(models.RequestLocal, {foreignKey: 'requestLocal_id', hooks: true});
	Support.belongsTo(models.User, {foreignKey: 'user_id', hooks: true});
  };
  return Support;
};