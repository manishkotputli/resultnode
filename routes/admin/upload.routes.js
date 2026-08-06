'use strict';
const express = require('express');
const router = express.Router();
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const { makeUploader } = require('../../middlewares/upload');

const upload = makeUploader('blog-content');

router.use(isAdminAuthenticated);

// CKEditor expects: { url: "..." } on success OR { error: { message: "..." } } on failure
router.post('/upload/editor-image', upload.single('upload'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { message: 'No file uploaded.' } });
  }
  res.json({ url: `/uploads/blog-content/${req.file.filename}` });
});

module.exports = router;