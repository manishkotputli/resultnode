'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      category_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      short_description: { type: Sequelize.TEXT },
      full_description: { type: Sequelize.TEXT('long') },
      post_date: { type: Sequelize.DATEONLY },
      updated_date: { type: Sequelize.DATEONLY },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_marquee: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_top: { type: Sequelize.BOOLEAN, defaultValue: false },
      highlight_color: { type: Sequelize.STRING(20) },
      views_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      clicks_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      meta_title: { type: Sequelize.STRING },
      meta_keywords: { type: Sequelize.TEXT },
      meta_description: { type: Sequelize.TEXT },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('posts', ['is_marquee']);
    await queryInterface.addIndex('posts', ['is_top']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  },
};
