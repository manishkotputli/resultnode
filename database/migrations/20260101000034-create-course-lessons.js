'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('course_lessons', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      course_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      lesson_number: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      video_url: Sequelize.STRING,
      notes: Sequelize.TEXT,
      duration_minutes: Sequelize.INTEGER,
      is_free_preview: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('course_lessons');
  },
};
