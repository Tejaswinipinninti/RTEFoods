const router = require('express').Router();
const {
  getAllBlogs,
  getBlog,
  getPublishedBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleStatus
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllBlogs);
router.get('/published', getPublishedBlogs);
router.get('/:id', getBlog);
router.post('/', protect, admin, createBlog);
router.put('/:id', protect, admin, updateBlog);
router.delete('/:id', protect, admin, deleteBlog);
router.patch('/:id/toggle-status', protect, admin, toggleStatus);

module.exports = router;
