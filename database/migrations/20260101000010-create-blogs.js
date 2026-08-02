'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blogs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      short_description: { type: Sequelize.TEXT },
      content: { type: Sequelize.TEXT('long') },
      thumbnail: { type: Sequelize.STRING },
      gallery: { type: Sequelize.JSON },
      category_id: {
        type: Sequelize.INTEGER,
        references: { model: 'blog_categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      author_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      tags: { type: Sequelize.STRING },
      meta_title: { type: Sequelize.STRING },
      meta_keywords: { type: Sequelize.TEXT },
      meta_description: { type: Sequelize.TEXT },
      noindex: { type: Sequelize.BOOLEAN, defaultValue: false },
      nofollow: { type: Sequelize.BOOLEAN, defaultValue: false },
      canonical_url: { type: Sequelize.STRING },
      views: { type: Sequelize.INTEGER, defaultValue: 0 },
      word_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      read_time: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
      published_at: { type: Sequelize.DATE },
      likes_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      comments_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('blogs');
  },
};
