'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    queryInterface.addColumn(
      'Local',
      'city',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    ).then( function() {
      return queryInterface.addColumn(
        'Local',
        'state',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      );
    }).then( function() {
      return queryInterface.addColumn(
        'Local',
        'country',
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
    // return queryInterface.removeColumn('User', 'facebook_id').then( function() {
    //   return queryInterface.removeColumn('User', 'email');
    // })
    queryInterface.removeColumn('Local','city')
      .then( function() {
        queryInterface.removeColumn('Local','state')
      })
      .then( function() {
        queryInterface.removeColumn('Local','country')
      });
  }
};
