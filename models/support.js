'use strict';
module.exports = (sequelize, DataTypes) => {
  const Support = sequelize.define('Support', {
    user_id: 
    {
      type: DataTypes.INTEGER, 
      allowNull: false,
      primaryKey: true
    },
    requestLocal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {});
  Support.associate = function(models) {
    // associations can be defined here
	Support.belongsTo(models.RequestLocal, {foreignKey: 'requestLocal_id', hooks: true});
	Support.belongsTo(models.User, {foreignKey: 'user_id', hooks: true});
  };
  Support.removeAttribute('id');
  return Support;
};