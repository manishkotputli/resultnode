'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      commentable_type: { type: Sequelize.STRING, allowNull: false },
      commentable_id: { type: Sequelize.INTEGER, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      parent_id: { type: Sequelize.INTEGER },
      content: { type: Sequelize.TEXT, allowNull: false },
      is_approved: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('comments', ['commentable_type', 'commentable_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('comments');
  },
};
