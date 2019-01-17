'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    
    return queryInterface.addColumn(
      'Local',
      'description',
      Sequelize.STRING
    ).then( function() {
      return queryInterface.addColumn(
        'Local',
        'address',
        Sequelize.STRING
      );
    });
    */
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    
    return queryInterface.removeColumn('Local', 'address').then( function() {
      return queryInterface.removeColumn('Local', 'description');
    })
    */
  }
};
