const express = require('express');
const { cloudinary, upload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');
const requireUniversity = require('../middleware/requireUniversity');

const router = express.Router();
const privateUpload = [authMiddleware, requireUniversity];

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'khoj-items',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images to Cloudinary
 * @access  Private (requires authentication)
 */
router.post('/images', ...privateUpload, (req, res) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary upload error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to upload images. Please check Cloudinary credentials.',
      });
    }

    (async () => {
      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided',
        });
      }

      const imageUrls = await Promise.all(req.files.map((file) => uploadToCloudinary(file.buffer)));

      res.status(200).json({
        success: true,
        message: `${imageUrls.length} image(s) uploaded successfully`,
        images: imageUrls,
      });
    })().catch((error) => {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload images',
      });
    });
  });
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private (requires authentication)
 */
router.post('/image', ...privateUpload, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary upload error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to upload image. Please check Cloudinary credentials.',
      });
    }

    (async () => {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image provided',
        });
      }

      const imageUrl = await uploadToCloudinary(req.file.buffer);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl,
      });
    })().catch((error) => {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    });
  });
});

module.exports = router;
