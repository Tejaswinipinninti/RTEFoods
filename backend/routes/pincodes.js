const router = require('express').Router();
const {
  getAllPincodes,
  getPincode,
  createPincode,
  updatePincode,
  deletePincode,
  bulkDelete,
  checkServiceability,
  bulkImportPincodes
} = require('../controllers/pincodeController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllPincodes);
router.get('/serviceable', checkServiceability);
router.get('/:id', getPincode);
router.post('/', protect, admin, createPincode);
router.post('/import', protect, admin, bulkImportPincodes);
router.put('/:id', protect, admin, updatePincode);
router.delete('/:id', protect, admin, deletePincode);
router.post('/bulk-delete', protect, admin, bulkDelete);

module.exports = router;
