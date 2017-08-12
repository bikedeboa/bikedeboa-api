'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn(
      'User',
      'email',
      Sequelize.STRING
    ).then( function() {
      return queryInterface.addColumn(
        'User',
        'facebook_id',
        Sequelize.STRING
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
    return queryInterface.removeColumn('User', 'facebook_id').then( function() {
      return queryInterface.removeColumn('User', 'email');
    })
  }
};
