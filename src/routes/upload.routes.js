const { Router } = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.post('/', authenticate, authorizeAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const uploads = await Promise.all(
      files.map(file =>
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'neelas-sarees', resource_type: 'image' },
            (error, result) => { if (error) reject(error); else resolve(result.secure_url); }
          ).end(file.buffer);
        })
      )
    );
    res.json({ success: true, data: uploads });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed', error: String(error) });
  }
});

module.exports = router;
