'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contact_messages', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      subject: Sequelize.STRING,
      message: { type: Sequelize.TEXT, allowNull: false },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('contact_messages');
  },
};
