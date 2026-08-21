import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/response.util';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/apiError.util';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const sendVerificationOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw ApiError.badRequest('Email is required');
    const result = await AuthService.sendVerificationOtp(email);
    return sendResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await AuthService.register({ ...validated, isVerified: req.body.isVerified });
    
    // Explicitly DO NOT set cookies or return tokens here per requirements
    // User must log in after registration
    const responseData = { user: result.user };

    return sendResponse(res, 201, 'User registered successfully', responseData);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await AuthService.login(validated.email, validated.password);
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return sendResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return sendResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw ApiError.unauthorized();
    }
    const user = await AuthService.getUserProfile(req.user.id);
    return sendResponse(res, 200, 'User profile fetched', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) throw ApiError.unauthorized();
    const updated = await AuthService.updateProfile(req.user.id, req.body);
    return sendResponse(res, 200, 'Profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token required');
    }

    const tokens = await AuthService.refreshTokens(refreshToken);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return sendResponse(res, 200, 'Tokens refreshed', tokens);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw ApiError.badRequest('Email is required');
    const result = await AuthService.forgotPassword(email);
    return sendResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

export const verifyResetOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw ApiError.badRequest('Email and OTP are required');
    await AuthService.verifyResetOtp(email, otp);
    return sendResponse(res, 200, 'OTP verified successfully. You can now set your new password.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, token, newPassword } = req.body;
    if (!email || !newPassword) throw ApiError.badRequest('Email and new password are required');
    await AuthService.resetPassword({ email, otp, token, newPassword });
    return sendResponse(res, 200, 'Password has been reset successfully. Please log in with your new password.');
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, otp, email } = req.body;
    const code = otp || token;
    if (!code) throw ApiError.badRequest('Verification code/token is required');
    await AuthService.verifyEmail(code, email);
    return sendResponse(res, 200, 'Email verified successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

