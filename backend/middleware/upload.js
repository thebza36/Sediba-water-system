const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads folder if it doesn't exist
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* STORAGE CONFIG */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

/* FILE FILTER (ALLOW ONLY IMAGES) */

const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpg|jpeg|png|webp|svg/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }

};

/* MULTER UPLOAD */

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});

module.exports = upload;