const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/security');

router.post('/register', authLimiter, validateRegister, validate, registerUser);
router.post('/login', authLimiter, validateLogin, validate, loginUser);
router.get('/me', protect, getMe);
router.get('/', protect, getAllUsers);

module.exports = router;
