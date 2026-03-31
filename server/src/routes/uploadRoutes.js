const express = require('express');
const { upload } = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');
const requireUniversity = require('../middleware/requireUniversity');

const router = express.Router();
const privateUpload = [authMiddleware, requireUniversity];

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images to Cloudinary
 * @access  Private (requires authentication)
 */
router.post('/images', authMiddleware, (req, res) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary upload error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to upload images. Please check Cloudinary credentials.',
      });
    }

    try {
      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided',
        });
      }

      // Extract Cloudinary URLs from uploaded files
      const imageUrls = req.files.map(file => file.path);

      res.status(200).json({
        success: true,
        message: `${imageUrls.length} image(s) uploaded successfully`,
        images: imageUrls,
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload images',
      });
    }
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

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image provided',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: req.file.path,
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    }
  });
});

module.exports = router;
