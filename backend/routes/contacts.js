const router = require('express').Router();
const {
  createContact,
  getAllContacts,
  getContact,
  updateStatus,
  replyToContact,
  deleteContact,
  bulkDelete
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

router.post('/', createContact);
router.get('/', protect, admin, getAllContacts);
router.post('/bulk-delete', protect, admin, bulkDelete);
router.get('/:id', protect, admin, getContact);
router.patch('/:id/status', protect, admin, updateStatus);
router.put('/:id/status', protect, admin, updateStatus);
router.post('/:id/reply', protect, admin, replyToContact);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;
