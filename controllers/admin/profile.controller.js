'use strict';
const bcrypt = require('bcryptjs');
const db = require('../../models');

async function edit(req, res, next) {
  try {
    const user = await db.User.findByPk(req.session.admin.id, { include: [{ model: db.Role }] });
    if (!user) {
      req.flash('error', 'Your account could not be found.');
      return res.redirect('/admin/dashboard');
    }
    res.render('admin/profile/index', {
      title: 'My Profile',
      active: 'profile',
      profileUser: user,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await db.User.scope('withPassword').findByPk(req.session.admin.id);
    if (!user) {
      req.flash('error', 'Your account could not be found.');
      return res.redirect('/admin/dashboard');
    }

    if (!req.body.name || !req.body.email) {
      req.flash('error', 'Name and Email are required.');
      return res.redirect('/admin/profile');
    }

    const data = {
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      phone: req.body.phone || null,
      address: req.body.address || null,
    };

    if (req.file) {
      data.profile_photo = `/uploads/profile/${req.file.filename}`;
    }

    await user.update(data);

    // Keep the session's mini-profile in sync (used by header avatar/name).
    req.session.admin.name = user.name;
    req.session.admin.email = user.email;
    if (req.file) req.session.admin.avatar = data.profile_photo;

    req.flash('success', 'Profile updated successfully.');
    res.redirect('/admin/profile');
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    if (!current_password || !new_password || !confirm_password) {
      req.flash('error', 'All password fields are required.');
      return res.redirect('/admin/profile');
    }
    if (new_password !== confirm_password) {
      req.flash('error', 'New password and confirmation do not match.');
      return res.redirect('/admin/profile');
    }
    if (new_password.length < 6) {
      req.flash('error', 'New password must be at least 6 characters.');
      return res.redirect('/admin/profile');
    }

    const user = await db.User.scope('withPassword').findByPk(req.session.admin.id);
    const ok = await bcrypt.compare(current_password, user.password);
    if (!ok) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/admin/profile');
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    req.flash('success', 'Password changed successfully.');
    res.redirect('/admin/profile');
  } catch (err) {
    next(err);
  }
}

module.exports = { edit, update, changePassword };
