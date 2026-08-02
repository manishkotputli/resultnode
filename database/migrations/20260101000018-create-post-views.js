'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_views', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      trackable_type: { type: Sequelize.STRING, allowNull: false },
      trackable_id: { type: Sequelize.INTEGER, allowNull: false },
      event_type: { type: Sequelize.STRING(10), allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      ip_address: Sequelize.STRING,
      user_agent: Sequelize.STRING,
      referrer_url: Sequelize.STRING,
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('post_views', ['trackable_type', 'trackable_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('post_views');
  },
};
