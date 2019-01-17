'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn(
      'RequestLocal',
      'text',
      {
        type: Sequelize.TEXT
      }
    ).then(function(){
      queryInterface.addColumn(
      'RequestLocal',
      'user_id',
        {
          type: Sequelize.INTEGER
        }
      );
    });
    
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn(
      'RequestLocal',
      'text'
    ).then(function(){
      queryInterface.removeColumn(
        'RequestLocal',
        'user_id'
      )
    });
  }
};
