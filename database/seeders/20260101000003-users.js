'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const roles = await queryInterface.sequelize.query('SELECT id, prefix FROM roles', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const roleId = (prefix) => roles.find((r) => r.prefix === prefix).id;
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      {
        role_id: roleId('US'), user_code: 'US-000001', name: 'Aarav Sharma',
        email: 'student@example.com', username: 'aarav', password: passwordHash,
        phone: '9000000001', is_active: true, created_at: now, updated_at: now,
      },
      {
        role_id: roleId('AD'), user_code: 'AD-000001', name: 'Content Desk',
        email: 'admin@example.com', username: 'contentdesk', password: passwordHash,
        phone: '9000000002', is_active: true, created_at: now, updated_at: now,
      },
    ];
    await queryInterface.bulkInsert('users', users);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
