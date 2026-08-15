'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('banners', 'image', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'color'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('banners', 'image');
  }
};