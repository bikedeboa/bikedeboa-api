'use strict';
module.exports = function(sequelize, DataTypes) {
  var DataSource = sequelize.define('DataSource', {
    name: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    timestamps: true,
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        DataSource.hasMany(models.Local, { foreignKey: 'datasource_id', hooks: false });
      }
    }
  });
  return DataSource;
};