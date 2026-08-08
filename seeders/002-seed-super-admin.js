'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Set these in .env before running the seeder.
    // Example:
    // SEED_ADMIN_EMAIL=admin@example.com
    // SEED_ADMIN_PASSWORD=change-this-password
    // SEED_ADMIN_NAME=Super Admin
    // SEED_ADMIN_USERNAME=admin
    // SEED_ADMIN_CODE=SA001

    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const name = process.env.SEED_ADMIN_NAME || 'Super Admin';
    const username = process.env.SEED_ADMIN_USERNAME || 'admin';
    const userCode = process.env.SEED_ADMIN_CODE || 'SA001';

    if (!email || !password) {
      throw new Error(
        'Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in environment.'
      );
    }

    const [roles] = await queryInterface.sequelize.query(
      'SELECT id FROM roles WHERE name = :name LIMIT 1',
      { replacements: { name: 'Super Admin' } }
    );

    if (roles.length === 0) {
      throw new Error(
        'Super Admin role not found. Run the roles seeder first.'
      );
    }

    const roleId = roles[0].id;
    const passwordHash = await bcrypt.hash(password, 12);

    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email } }
    );

    if (existing.length === 0) {
      await queryInterface.bulkInsert('users', [{
        role_id: roleId,
        user_code: userCode,
        name,
        email,
        username,
        password: passwordHash,
        phone: null,
        profile_photo: null,
        address: null,
        is_active: 1,
        email_verified_at: now,
        created_at: now,
        updated_at: now
      }]);
    } else {
      // Do not overwrite the existing password on repeated deployments.
      await queryInterface.sequelize.query(
        `UPDATE users
         SET role_id = :role_id,
             user_code = :user_code,
             name = :name,
             username = :username,
             is_active = 1,
             updated_at = :updated_at
         WHERE id = :id`,
        {
          replacements: {
            id: existing[0].id,
            role_id: roleId,
            user_code: userCode,
            name,
            username,
            updated_at: now
          }
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const email = process.env.SEED_ADMIN_EMAIL;

    if (email) {
      await queryInterface.bulkDelete('users', { email });
    }
  }
};
