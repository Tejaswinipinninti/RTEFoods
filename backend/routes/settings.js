const router = require('express').Router();
const {
  getSettings,
  updateSettings,
  updateSection
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', protect, admin, updateSettings);
router.put('/:section', protect, admin, updateSection);

module.exports = router;
