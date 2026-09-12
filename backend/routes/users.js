const router = require('express').Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  exportUsers
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, getAllUsers);
router.get('/export', protect, admin, exportUsers);
router.get('/:id', protect, admin, getUser);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.patch('/:id/block', protect, admin, blockUser);
router.put('/:id/block', protect, admin, blockUser);
router.patch('/:id/unblock', protect, admin, unblockUser);

module.exports = router;
