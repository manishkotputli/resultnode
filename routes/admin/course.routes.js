'use strict';
const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/admin/course.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const { makeUploader } = require('../../middlewares/upload');

const upload = makeUploader('course');

router.use(isAdminAuthenticated);

router.get('/courses', courseController.index);
router.get('/courses/create', courseController.createForm);
router.post('/courses', upload.single('thumbnail'), courseController.store);
router.get('/courses/:id/edit', courseController.editForm);
router.post('/courses/:id/update', upload.single('thumbnail'), courseController.update);
router.post('/courses/:id/delete', courseController.destroy);

router.get('/courses/:courseId/lessons', courseController.lessonsIndex);
router.post('/courses/:courseId/lessons', courseController.storeLesson);
router.post('/courses/:courseId/lessons/:lessonId/update', courseController.updateLesson);
router.post('/courses/:courseId/lessons/:lessonId/delete', courseController.destroyLesson);

module.exports = router;
