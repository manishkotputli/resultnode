'use strict';
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function makeUploader(subfolder) {
  const dest = path.join(__dirname, '..', 'public', 'uploads', subfolder);
  fs.mkdirSync(dest, { recursive: true });
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });
  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = /image\/(jpeg|png|jpg|webp|gif)/.test(file.mimetype);
      cb(ok ? null : new Error('Only image uploads are allowed'), ok);
    },
  });
}

module.exports = { makeUploader };
