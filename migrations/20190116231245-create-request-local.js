'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('requestLocals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
        allowNull: false,
      },
      lat: {
        type: Sequelize.STRING
        allowNull: false,
      },
      lng: {
        type: Sequelize.STRING
        allowNull: false,
      },
      support: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.TEXT
      },
      photo: {
        type: Sequelize.STRING
      },
      views: {
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      authorIP: {
        type: Sequelize.STRING
      },
      isCommerce: {
        type: Sequelize.BOOLEAN
      },
      commerceName: {
        type: Sequelize.STRING
      },
      commercePhone: {
        type: Sequelize.STRING
      },
      commerceRelation: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('requestLocals');
  }
};