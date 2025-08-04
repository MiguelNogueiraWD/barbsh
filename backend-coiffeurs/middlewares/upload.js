const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const name = `${Date.now()}_${file.originalname}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

module.exports = upload;
