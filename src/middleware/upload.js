const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // sanitize original filename: remove spaces & unsafe chars
    const original = file.originalname;
    const safeBase = original
      .replace(/\s+/g, '-')         // spaces → dashes
      .replace(/[^a-zA-Z0-9.\-_]/g, ''); // strip odd chars
    cb(null, Date.now() + '-' + safeBase);
  }
});

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.test(ext) ? cb(null, true) : cb(new Error('Only .jpg, .png, .pdf files allowed!'));
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB
});
