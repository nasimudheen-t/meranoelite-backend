// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Ensure uploads folder exists
// const uploadDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     // Generate unique filename using Date.now() and preserving the original extension
//     const ext = path.extname(file.originalname);
//     cb(null, `${Date.now()}${ext}`);
//   }
// });

// // Configure file filter
// const fileFilter = (req, file, cb) => {
//   const filetypes = /jpeg|jpg|png|webp/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true);
//   }
//   return cb(new Error('Only .png, .jpg, .jpeg and .webp formats are allowed!'), false);
// };

// // Create Multer upload instance
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: fileFilter
// });

// module.exports = upload;

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => Date.now().toString(),
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(
    require("path").extname(file.originalname).toLowerCase(),
  );
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }

  return cb(
    new Error("Only .png, .jpg, .jpeg and .webp formats are allowed!"),
    false,
  );
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;

