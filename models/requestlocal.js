'use strict';
module.exports = (sequelize, DataTypes) => {
  const RequestLocal = sequelize.define('RequestLocal', {
    lat: DataTypes.STRING,
    lng: DataTypes.STRING,
    support: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    photo: DataTypes.STRING,
    views: DataTypes.INTEGER,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    authorIP: DataTypes.STRING,
    isCommerce: DataTypes.BOOLEAN,
    commerceName: DataTypes.STRING,
    commercePhone: DataTypes.STRING,
    commerceRelation: DataTypes.STRING
  }, {});
  RequestLocal.associate = function(models) {
    // associations can be defined here
  };
  return RequestLocal;
};