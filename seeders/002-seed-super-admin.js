'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {

        const now = new Date();

        const users = [
            {
                role: 'Super Admin',
                user_code: 'SA001',
                name: 'Manish Prajapati',
                email: 'soumyaitsolutionmanish@gmail.com',
                username: 'manishprajapati',
                password: 'Sitmanish2005',
                phone: '9521198824',
                address: 'Kotputli, Rajasthan'
            },
            {
                role: 'User',
                user_code: 'AD001',
                name: 'Krishan Prajapti',
                email: 'krishanrajnota@gmail.com',
                username: 'krishanrajnota',
                password: '12345678',
                phone: '7792947741',
                address: 'Kotputli, Rajasthan'
            },
            {
                role: 'Admin',
                user_code: 'ADM002',
                name: 'Naresh Prajapti',
                email: 'naresh@gmail.com',
                username: 'nareshprajapati',
                password: 'naresh1234',
                phone: '7850908014',
                address: 'Kotputli, Rajasthan'
            }
        ];

        for (const user of users) {

            // Get role ID
            const [roles] = await queryInterface.sequelize.query(
                `SELECT id
                 FROM roles
                 WHERE name = :role
                 LIMIT 1`,
                {
                    replacements: {
                        role: user.role
                    }
                }
            );

            if (roles.length === 0) {
                throw new Error(
                    `Role "${user.role}" not found. Run 001-seed-roles.js first.`
                );
            }

            const roleId = roles[0].id;

            // Check existing user
            const [existing] = await queryInterface.sequelize.query(
                `SELECT id
                 FROM users
                 WHERE username = :username
                 LIMIT 1`,
                {
                    replacements: {
                        username: user.username
                    }
                }
            );

            if (existing.length > 0) {
                console.log(
                    `⚠️ User already exists: ${user.username}`
                );
                continue;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(
                user.password,
                12
            );

            // Create user
            await queryInterface.bulkInsert('users', [{
                role_id: roleId,
                user_code: user.user_code,
                name: user.name,
                email: user.email,
                username: user.username,
                password: passwordHash,
                phone: user.phone,
                profile_photo: null,
                address: user.address,
                is_active: 1,
                email_verified_at: now,
                created_at: now,
                updated_at: now
            }]);

            console.log(
                `✅ Created: ${user.name} (${user.role})`
            );
        }
    },

    async down(queryInterface, Sequelize) {

        await queryInterface.bulkDelete('users', {
            username: {
                [Sequelize.Op.in]: [
                    'manishprajapati',
                    'rahulsharma',
                    'amitadmin'
                ]
            }
        });

    }
};