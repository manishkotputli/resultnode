'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      likeable_type: { type: Sequelize.STRING, allowNull: false },
      likeable_id: { type: Sequelize.INTEGER, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('likes', ['likeable_type', 'likeable_id', 'user_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('likes');
  },
};
