'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dynamic_fields', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      table_name: { type: Sequelize.STRING, allowNull: false },
      record_id: { type: Sequelize.INTEGER, allowNull: false },
      group_name: { type: Sequelize.STRING },
      field_label: { type: Sequelize.STRING, allowNull: false },
      field_type: { type: Sequelize.STRING(20), defaultValue: 'text' },
      field_value: { type: Sequelize.TEXT('long') },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('dynamic_fields', ['table_name', 'record_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('dynamic_fields');
  },
};
