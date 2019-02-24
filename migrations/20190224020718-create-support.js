'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Supports', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'user', key: 'id' }
      },
      requestLocal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'requestlocal', key: 'id' }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
    .then(() => {
      return queryInterface.addConstraint('Users', ['username'], {
              type: 'primary key',
              name: 'Supports_pkey'
             });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Supports');
  }
};