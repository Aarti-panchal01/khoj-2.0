const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Verify required environment variables without logging credential values
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('ERROR: Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Restrict to static image formats only — no gif/webp to prevent animated content abuse
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — tightened from 10MB

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'khoj-items',
    allowed_formats: ALLOWED_FORMATS,
    resource_type: 'image',
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    // Validate MIME type — do not trust file extension alone
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = { cloudinary, upload };
