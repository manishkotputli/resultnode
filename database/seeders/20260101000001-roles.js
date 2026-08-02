'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { name: 'User', prefix: 'US', created_at: now, updated_at: now },
      { name: 'Super Admin', prefix: 'SA', created_at: now, updated_at: now },
      { name: 'Admin', prefix: 'AD', created_at: now, updated_at: now },
      { name: 'Developer', prefix: 'DEV', created_at: now, updated_at: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
