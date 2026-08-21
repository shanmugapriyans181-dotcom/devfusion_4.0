import { Router } from 'express';
import {
  register,
  sendVerificationOtp,
  login,
  logout,
  getMe,
  updateProfile,
  refresh,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  verifyEmail,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/send-verification-otp', sendVerificationOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

export default router;
