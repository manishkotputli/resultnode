'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('faq_answers', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      faq_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'faqs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      answer: { type: Sequelize.TEXT, allowNull: false },
      image: { type: Sequelize.STRING },
      ordering: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('faq_answers');
  },
};
