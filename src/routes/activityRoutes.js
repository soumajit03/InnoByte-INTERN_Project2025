const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTaskLogs, getMyLogs } = require('../controllers/activityController');

router.get('/task/:taskId', protect, getTaskLogs);
router.get('/me', protect, getMyLogs);

module.exports = router;
