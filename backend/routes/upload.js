const router = require('express').Router();
const multer = require('multer');
const { uploadFile, uploadMultiple, deleteFile } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/', protect, admin, upload.single('file'), uploadFile);
router.post('/multiple', protect, admin, upload.array('files', 10), uploadMultiple);
router.delete('/', protect, admin, deleteFile);

module.exports = router;
