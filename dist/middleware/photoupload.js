const path = require('path');
const multer = require('multer');
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../image"));
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  }
});
const photoUpload = multer({
  storage: fileStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({
        message: "Unsupported file format"
      }, false);
    }
  },
  limits: {
    fieldSize: 1024 * 1024
  } //1mega
});
module.exports = photoUpload;