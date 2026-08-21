import tls from 'tls';
import { logger } from '../utils/logger.util';
import { prisma } from '../config/prisma.config';

export interface EmailPayload {
  to: string;
  subject: string;
  template: 'JOB_APPROVED' | 'INTERVIEW_SCHEDULED' | 'FEEDBACK_SUBMITTED' | 'OFFER_LETTER_SENT' | 'VERIFICATION_EMAIL' | 'PASSWORD_RESET' | 'PASSWORD_RESET_OTP';
  data: Record<string, any>;
}

export class EmailService {
  private static emailLogs: Array<{
    id: string;
    from: string;
    to: string;
    subject: string;
    template: string;
    content: string;
    otp?: string;
    sentAt: Date;
  }> = [];

  static readonly GMAIL_USER = process.env.EMAIL_USER || 'shanmugapriyans0418@gmail.com';
  static readonly GMAIL_PASS = process.env.EMAIL_PASSWORD || 'ujbrjbuhqihdnple';
  static readonly DEFAULT_SENDER = `HireAI ATS <${EmailService.GMAIL_USER}>`;

  /**
   * Sends real email via Gmail SMTP using native TLS (Port 465)
   */
  private static sendViaGmailSmtp(to: string, subject: string, bodyText: string): Promise<boolean> {
    return new Promise((resolve) => {
      const user = EmailService.GMAIL_USER;
      const pass = EmailService.GMAIL_PASS;

      const socket = tls.connect(465, 'smtp.gmail.com', { rejectUnauthorized: false }, () => {
        logger.info(`Connected to Gmail SMTP for recipient: ${to}`);
      });

      socket.setEncoding('utf8');
      let step = 0;

      socket.on('data', (data) => {
        const str = data.toString();

        if (str.startsWith('220')) {
          socket.write('EHLO localhost\r\n');
        } else if (str.startsWith('250') && step === 0) {
          step = 1;
          socket.write('AUTH LOGIN\r\n');
        } else if (str.startsWith('334') && step === 1) {
          step = 2;
          socket.write(Buffer.from(user).toString('base64') + '\r\n');
        } else if (str.startsWith('334') && step === 2) {
          step = 3;
          socket.write(Buffer.from(pass).toString('base64') + '\r\n');
        } else if (str.startsWith('235')) {
          step = 4;
          socket.write(`MAIL FROM:<${user}>\r\n`);
        } else if (str.startsWith('250') && step === 4) {
          step = 5;
          socket.write(`RCPT TO:<${to}>\r\n`);
        } else if (str.startsWith('250') && step === 5) {
          step = 6;
          socket.write('DATA\r\n');
        } else if (str.startsWith('354') && step === 6) {
          step = 7;
          const msg = `From: HireAI ATS <${user}>\r\nTo: <${to}>\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${bodyText}\r\n.\r\n`;
          socket.write(msg);
        } else if (str.startsWith('250') && step === 7) {
          logger.info(`✅ [REAL GMAIL DELIVERED] Email successfully sent to ${to} from ${user}`);
          socket.write('QUIT\r\n');
          resolve(true);
        } else if (str.startsWith('535') || str.startsWith('550') || str.startsWith('553')) {
          logger.error(`❌ [GMAIL SMTP ERROR] ${str.trim()}`);
          socket.end();
          resolve(false);
        }
      });

      socket.on('error', (err) => {
        logger.error(`SMTP TLS Socket error: ${err.message}`);
        resolve(false);
      });

      // 15 seconds timeout
      setTimeout(() => {
        try {
          socket.end();
        } catch (e) {}
        resolve(false);
      }, 15000);
    });
  }

  static async sendEmail(payload: EmailPayload) {
    const { to, subject, template, data } = payload;
    const from = EmailService.DEFAULT_SENDER;
    
    let content = '';
    let otp = data.otp || '';

    switch (template) {
      case 'PASSWORD_RESET_OTP':
        content = `Dear User,\n\nWe received a request to reset your password for your HireAI ATS account.\n\nYour 6-digit Password Reset OTP is:\n\n👉  ${otp}  👈\n\nThis OTP is valid for 10 minutes. Please enter this OTP in the application to set your new password.\n\nIf you did not request a password reset, please ignore this message.\n\nBest regards,\nHireAI Security Team\nSender: ${from}`;
        logger.info(`
========================================================
🔑 PASSWORD RESET OTP DISPATCHED
--------------------------------------------------------
From: ${from}
To:   ${to}
OTP:  👉 ${otp} 👈
Subject: ${subject}
========================================================
`);
        break;

      case 'VERIFICATION_EMAIL':
        content = `Welcome to HireAI ATS!\n\nYour Email Verification OTP is:\n\n👉  ${otp || 'VERIFIED'}  👈\n\nOr click the verification link below:\n${data.verifyUrl}\n\nBest regards,\nHireAI Team\nSender: ${from}`;
        logger.info(`
========================================================
🚀 EMAIL VERIFICATION DISPATCHED
--------------------------------------------------------
From: ${from}
To:   ${to}
OTP:  👉 ${otp || data.verifyToken} 👈
Link: ${data.verifyUrl}
========================================================
`);
        break;

      case 'OFFER_LETTER_SENT':
        content = `Dear ${data.candidateName},\n\nWe are thrilled to extend an official offer of employment for the position of ${data.position} at ${data.companyName || 'TechNova Solutions'}.\n\nOffer Details:\n- Annual Salary: $${data.salary?.toLocaleString()}\n- Start Date: ${new Date(data.joiningDate).toLocaleDateString()}\n- Location: ${data.location}\n\nPlease log in to your Candidate Portal to review and electronically accept your offer.\n\nBest regards,\nRecruitment Team\nSender: ${from}`;
        break;

      case 'JOB_APPROVED':
        content = `Hello Hiring Team,\n\nThe job posting "${data.jobTitle}" has been reviewed and approved by the Recruiter (${data.recruiterName}). It is now ACTIVE and accepting candidate applications.\nSender: ${from}`;
        break;

      case 'INTERVIEW_SCHEDULED':
        content = `Dear ${data.candidateName},\n\nYour interview for ${data.position} has been scheduled for ${new Date(data.scheduledAt).toLocaleString()}.\nMeeting Link: ${data.meetingUrl}\nSender: ${from}`;
        break;

      case 'FEEDBACK_SUBMITTED':
        content = `Hello Hiring Manager,\n\nInterviewer ${data.interviewerName} has submitted feedback for candidate ${data.candidateName}.\nOverall Rating: ${data.overallRating}/5.0\nRecommendation: ${data.recommendation}\nSender: ${from}`;
        break;

      case 'PASSWORD_RESET':
        content = `We received a request to reset your password.\n\nPlease click the link below to set a new password:\n${data.resetUrl}\n\nThis link will expire in 1 hour.\nSender: ${from}`;
        break;

      default:
        content = `Notification regarding ${subject}\nSender: ${from}`;
    }

    const logEntry = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      from,
      to,
      subject,
      template,
      content,
      otp,
      sentAt: new Date(),
    };

    this.emailLogs.unshift(logEntry);

    // 1. Dispatch real email via Gmail SMTP
    this.sendViaGmailSmtp(to, subject, content).catch((e) => {
      logger.error(`Error in sendViaGmailSmtp: ${e.message}`);
    });

    // 2. Also push a notification to user in MySQL database
    try {
      const user = await prisma.user.findUnique({ where: { email: to } });
      if (user) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: subject,
            message: otp ? `Your verification code is ${otp}. Valid for 10 minutes.` : content.substring(0, 150) + '...',
            type: template,
            isRead: false,
          },
        });
      }
    } catch (e) {}

    return logEntry;
  }

  static getDispatchedEmails(recipientEmail?: string) {
    if (recipientEmail) {
      return this.emailLogs.filter(e => e.to === recipientEmail);
    }
    return this.emailLogs;
  }
}
