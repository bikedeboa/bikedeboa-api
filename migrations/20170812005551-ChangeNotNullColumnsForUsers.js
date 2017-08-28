'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    return queryInterface.changeColumn(
      'User',
      'username',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    ).then( function() {
      return queryInterface.changeColumn(
        'User',
        'password',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      );
    });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */

    return queryInterface.changeColumn(
      'User',
      'username',
      {
        type: Sequelize.STRING,
        allowNull: false
      }
    ).then( function() {
      return queryInterface.changeColumn(
        'User',
        'password',
        {
          type: Sequelize.STRING,
          allowNull: false
        }
      );
    });
  }
};
