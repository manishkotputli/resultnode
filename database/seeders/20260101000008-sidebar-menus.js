'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    // Top-level module list the user asked for ("ek all modules add list
    // hogi to admin mein dekhunga") - drives the future admin sidebar.
    await queryInterface.bulkInsert('sidebar_menus', [
      { name: 'Dashboard', icon: 'ti-dashboard', route: '/admin', order: 1, is_active: true, created_at: now, updated_at: now },
      { name: 'Posts', icon: 'ti-file-text', route: '/admin/posts', order: 2, is_active: true, created_at: now, updated_at: now },
      { name: 'Categories', icon: 'ti-category', route: '/admin/categories', order: 3, is_active: true, created_at: now, updated_at: now },
      { name: 'Blog', icon: 'ti-notes', route: '/admin/blog', order: 4, is_active: true, created_at: now, updated_at: now },
      { name: 'Course', icon: 'ti-school', route: '/admin/courses', order: 5, is_active: true, created_at: now, updated_at: now },
      { name: 'Test Series', icon: 'ti-clipboard-list', route: '/admin/test-series', order: 6, is_active: true, created_at: now, updated_at: now },
      { name: 'Income - Expense', icon: 'ti-report-money', route: '/admin/income-expense', order: 7, is_active: true, created_at: now, updated_at: now },
      { name: 'Scraping', icon: 'ti-download', route: '/admin/scraping', order: 8, is_active: true, created_at: now, updated_at: now },
      { name: 'Users', icon: 'ti-users', route: '/admin/users', order: 9, is_active: true, created_at: now, updated_at: now },
      { name: 'Settings', icon: 'ti-settings', route: '/admin/settings', order: 10, is_active: true, created_at: now, updated_at: now },
    ]);

    const roles = await queryInterface.sequelize.query('SELECT id, prefix FROM roles', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const menus = await queryInterface.sequelize.query('SELECT id FROM sidebar_menus', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const saId = roles.find((r) => r.prefix === 'SA').id;
    const devId = roles.find((r) => r.prefix === 'DEV').id;

    // Super Admin and Developer get full access to every module by default.
    // Admin permissions are intentionally left for the (future) admin UI to
    // configure per-menu.
    const perms = [];
    menus.forEach((m) => {
      [saId, devId].forEach((roleId) => {
        perms.push({
          role_id: roleId, sidebar_menu_id: m.id,
          can_view: true, can_add: true, can_edit: true, can_delete: true,
          created_at: now, updated_at: now,
        });
      });
    });
    await queryInterface.bulkInsert('sidebar_menu_permissions', perms);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('sidebar_menu_permissions', null, {});
    await queryInterface.bulkDelete('sidebar_menus', null, {});
  },
};
