'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const roles = [
      { id: 1, name: 'User',        prefix: 'US'  },
      { id: 2, name: 'Super Admin', prefix: 'SA'  },
      { id: 3, name: 'Admin',       prefix: 'AD'  },
      { id: 4, name: 'Developer',   prefix: 'DEV' }
    ];

    for (const role of roles) {
      const [rows] = await queryInterface.sequelize.query(
        'SELECT id FROM roles WHERE name = :name OR prefix = :prefix LIMIT 1',
        { replacements: role }
      );

      if (rows.length === 0) {
        await queryInterface.bulkInsert('roles', [{
          id: role.id,
          name: role.name,
          prefix: role.prefix,
          created_at: now,
          updated_at: now
        }]);
      } else {
        await queryInterface.sequelize.query(
          `UPDATE roles
           SET name = :name, prefix = :prefix, updated_at = :updated_at
           WHERE id = :id`,
          {
            replacements: {
              id: rows[0].id,
              name: role.name,
              prefix: role.prefix,
              updated_at: now
            }
          }
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      name: {
        [Sequelize.Op.in]: ['User', 'Super Admin', 'Admin', 'Developer']
      }
    });
  }
};
