'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      role_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      user_code: { type: Sequelize.STRING(20), unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      username: { type: Sequelize.STRING, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING },
      profile_photo: { type: Sequelize.STRING },
      address: { type: Sequelize.TEXT },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      email_verified_at: { type: Sequelize.DATE },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
