const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authValidation } = require('../validators/validationRules');

const router = express.Router();

// Public routes
router.post('/register', authValidation.register, validate, register);
router.post('/login', authValidation.login, validate, login);
router.post('/forgotpassword', authValidation.forgotPassword, validate, forgotPassword);
router.put('/resetpassword/:resettoken', authValidation.resetPassword, validate, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, authValidation.updateDetails, validate, updateDetails);
router.put('/updatepassword', protect, authValidation.updatePassword, validate, updatePassword);

module.exports = router;