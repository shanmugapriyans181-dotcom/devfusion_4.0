import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma.config';
import { mockStore } from '../config/mockStore';
import { config } from '../config/env.config';
import { ApiError } from '../utils/apiError.util';
import { UserRole } from '@prisma/client';
import { EmailService } from './email.service';

export class AuthService {
  static async sendVerificationOtp(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw ApiError.badRequest('Please enter a valid email address');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      throw ApiError.badRequest('An account with this email already exists. Please log in.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.emailVerificationToken.deleteMany({ where: { email: cleanEmail } });
    await prisma.emailVerificationToken.create({
      data: {
        email: cleanEmail,
        token: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    await EmailService.sendEmail({
      to: cleanEmail,
      subject: 'HireAI - Email Verification Code',
      template: 'VERIFICATION_EMAIL',
      data: { 
        otp,
        verifyUrl: `${config.frontendUrl}/verify-email?token=${otp}&email=${encodeURIComponent(cleanEmail)}` 
      },
    });

    return { success: true, message: `OTP sent successfully to ${cleanEmail}` };
  }

  static async register(data: { name: string; email: string; password: string; role?: UserRole; isVerified?: boolean }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw ApiError.badRequest('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const userRole = data.role || UserRole.CANDIDATE;

    let defaultCompany = await prisma.company.findFirst();
    if (!defaultCompany) {
      defaultCompany = await prisma.company.create({
        data: {
          name: 'HireAI Platform',
          industry: 'Software & Technology',
          description: 'Enterprise AI Recruitment & ATS Platform',
          locations: ['San Francisco, CA', 'Remote'],
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: userRole,
        emailVerified: data.isVerified ?? false,
        companyId: defaultCompany.id,
      },
    });

    if (userRole === UserRole.CANDIDATE) {
      await prisma.candidate.create({
        data: {
          userId: user.id,
          skills: [],
          languages: ['English'],
        },
      });
    }

    let verifyOtp: string | undefined = undefined;

    if (!data.isVerified) {
      verifyOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const verifyToken = crypto.randomBytes(24).toString('hex');
      
      await prisma.emailVerificationToken.deleteMany({ where: { email: user.email } });
      await prisma.emailVerificationToken.create({
        data: {
          email: user.email,
          token: verifyOtp,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      await EmailService.sendEmail({
        to: user.email,
        subject: 'Verify your email for HireAI ATS',
        template: 'VERIFICATION_EMAIL',
        data: { 
          otp: verifyOtp,
          verifyToken,
          verifyUrl: `${config.frontendUrl}/verify-email?token=${verifyOtp}&email=${encodeURIComponent(user.email)}` 
        }
      });
    }

    const tokens = this.generateTokens(user);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
      devOtp: verifyOtp,
      ...tokens,
    };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = this.generateTokens(user);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
        companyId: user.companyId,
      },
      ...tokens,
    };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        phone: true,
        location: true,
        companyId: true,
        company: true,
        candidate: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  static async updateProfile(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { company: true } });
    if (!user) throw ApiError.notFound('User not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.location) updateData.location = data.location;
    if (data.avatar) updateData.avatar = data.avatar;

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (user.companyId && (data.companyName || data.companyDescription || data.companyIndustry || data.companyWebsite || data.companyLocation)) {
      const companyUpdate: any = {};
      if (data.companyName) companyUpdate.name = data.companyName;
      if (data.companyDescription) companyUpdate.description = data.companyDescription;
      if (data.companyIndustry) companyUpdate.industry = data.companyIndustry;
      if (data.companyWebsite) companyUpdate.website = data.companyWebsite;
      if (data.companyLocation) companyUpdate.locations = [data.companyLocation];

      await prisma.company.update({
        where: { id: user.companyId },
        data: companyUpdate,
      });
    }

    return await this.getUserProfile(userId);
  }

  static async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any;
      const session = await prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw ApiError.unauthorized('Refresh token expired or invalid');
      }

      const tokens = this.generateTokens(session.user);

      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });

      return tokens;
    } catch (e: any) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  static async forgotPassword(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw ApiError.notFound('No account found with this email address');
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.passwordResetToken.deleteMany({ where: { email: cleanEmail } });
    await prisma.passwordResetToken.create({
      data: {
        email: cleanEmail,
        token: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      },
    });

    await EmailService.sendEmail({
      to: cleanEmail,
      subject: 'HireAI - Password Reset OTP Verification Code',
      template: 'PASSWORD_RESET_OTP',
      data: { 
        otp,
        email: cleanEmail,
        resetUrl: `${config.frontendUrl}/reset-password?email=${encodeURIComponent(cleanEmail)}&otp=${otp}`
      },
    });

    return { 
      email: cleanEmail, 
      devOtp: otp,
      message: `OTP sent successfully to ${cleanEmail}` 
    };
  }

  static async verifyResetOtp(email: string, otp: string) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    const record = await prisma.passwordResetToken.findFirst({
      where: {
        email: cleanEmail,
        token: cleanOtp,
      },
    });

    if (!record || record.expiresAt < new Date()) {
      throw ApiError.badRequest('Invalid or expired OTP code. Please request a new OTP.');
    }

    return true;
  }

  static async resetPassword(data: { email: string; otp?: string; token?: string; newPassword: string }) {
    const cleanEmail = data.email.toLowerCase().trim();
    const otpOrToken = (data.otp || data.token || '').trim();

    if (!otpOrToken) {
      throw ApiError.badRequest('OTP code is required to reset password');
    }

    const record = await prisma.passwordResetToken.findFirst({
      where: {
        email: cleanEmail,
        token: otpOrToken,
      },
    });

    if (!record || record.expiresAt < new Date()) {
      throw ApiError.badRequest('Invalid or expired OTP code. Please request a new OTP.');
    }

    if (data.newPassword.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters long');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.deleteMany({ where: { email: cleanEmail } });
    
    // Clear sessions
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
    }
    
    return true;
  }

  static async verifyEmail(code: string, email?: string) {
    const cleanCode = code.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : undefined;

    let record = await prisma.emailVerificationToken.findFirst({
      where: {
        token: cleanCode,
        ...(cleanEmail ? { email: cleanEmail } : {}),
      },
    });

    if (!record && cleanEmail) {
      record = await prisma.emailVerificationToken.findFirst({
        where: {
          email: cleanEmail,
          token: cleanCode,
        },
      });
    }

    if (!record || record.expiresAt < new Date()) {
      throw ApiError.badRequest('Invalid or expired verification code. Please request a new OTP.');
    }

    const user = await prisma.user.findUnique({
      where: { email: record.email },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    await prisma.emailVerificationToken.deleteMany({
      where: { email: record.email },
    });

    return { email: record.email };
  }

  static async logout(accessToken: string) {
    try {
      await prisma.session.deleteMany({
        where: { token: accessToken },
      });
    } catch (e) {}
    return true;
  }

  private static generateTokens(user: { id: string; email: string; role: string; name: string; companyId?: string | null }) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      companyId: user.companyId || undefined,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn as any,
    });

    return { accessToken, refreshToken };
  }
}

