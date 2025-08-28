const router = require('express').Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');
const isOwnerOrAssigned = require('../middleware/isOwnerOrAssigned');
const { getMyTasks } = require('../controllers/taskController');
const upload = require('../middleware/upload');
const { uploadAttachment } = require('../controllers/taskController');
const { addComment, deleteComment } = require('../controllers/taskController');
const { 
  validateCreateTask, 
  validateUpdateTask, 
  validateComment, 
  validateObjectId,
  validateTaskId,
  validateCommentId
} = require('../middleware/validators');
const validate = require('../middleware/validate');

router.post('/:id/upload', validateObjectId, validate, protect, upload.single('file'), uploadAttachment);


router.get('/me/assigned', protect, getMyTasks);

router.put('/:id', validateObjectId, validateUpdateTask, validate, protect, isOwnerOrAssigned, updateTask);    
router.delete('/:id', validateObjectId, validate, protect, isOwnerOrAssigned, deleteTask);
// Create a new task
router.post('/', validateCreateTask, validate, protect, createTask);

// Get all tasks (with filters/pagination)
router.get('/', protect, getTasks);

router.get('/:id', validateObjectId, validate, protect, getTaskById);      // get single task

router.post('/admin/fix-attachments', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }

  const tasks = await Task.find();
  let changed = 0;

  for (const t of tasks) {
    const fixed = t.attachments.map(p =>
      p.replace(/\\/g, '/').replace(/^uploads\//, '/uploads/')
    );
    if (JSON.stringify(fixed) !== JSON.stringify(t.attachments)) {
      t.attachments = fixed;
      await t.save();
      changed++;
    }
  }

  res.json({ success: true, changed });
});

router.post('/:id/comment', validateObjectId, validateComment, validate, protect, addComment);

// Delete a comment
router.delete('/:taskId/comment/:commentId', validateTaskId, validateCommentId, validate, protect, deleteComment);


module.exports = router;
