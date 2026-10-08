import nodemailer from 'nodemailer';

interface SendOtpEmailParams {
  toEmail: string;
  adminName: string;
  otp: string;
  roleTitle?: string;
}

export async function sendOtpEmail({
  toEmail,
  adminName,
  otp,
  roleTitle = 'Admin Portal Access',
}: SendOtpEmailParams): Promise<{ delivered: boolean; error?: string }> {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;

  // If no SMTP configured, log warning and return
  if (!user || !pass) {
    console.warn(
      `[Email Gateway] Real email not sent: SMTP_USER/GMAIL_USER or SMTP_PASS/GMAIL_APP_PASSWORD is not set in .env.local. OTP: ${otp} for ${toEmail}`
    );
    return {
      delivered: false,
      error: 'SMTP_CREDENTIALS_MISSING',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"Sumant Crafts Security" <${user}>`,
      to: toEmail,
      subject: `🔐 Your Admin 2FA Security Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #faf8f5; border: 1px solid #e9ddcb; border-radius: 16px; padding: 28px; color: #2a1c15;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: #9e381f; color: #fff; border-radius: 12px; font-size: 20px; font-weight: bold;">
              SK
            </div>
            <h2 style="color: #1d120c; margin: 12px 0 4px; font-size: 22px;">Sumant Handcrafted Mats</h2>
            <p style="margin: 0; color: #7f573c; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              Admin 2-Factor Authentication
            </p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e9ddcb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px; font-size: 14px; color: #553a2d;">
              Hello <strong>${adminName}</strong>,
            </p>
            <p style="margin: 0 0 16px; font-size: 13px; color: #684734; line-height: 1.5;">
              A login request for <strong>${roleTitle}</strong> was initiated. Use the security verification code below to complete your login:
            </p>

            <div style="background: #fdf4f0; border: 2px dashed #9e381f; border-radius: 10px; padding: 16px; text-align: center; margin: 16px 0;">
              <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #9e381f;">
                ${otp}
              </span>
            </div>

            <p style="margin: 12px 0 0; font-size: 11px; color: #888; text-align: center;">
              ⏳ This OTP code expires in <strong>5 minutes</strong>.
            </p>
          </div>

          <p style="margin: 0; font-size: 11px; color: #9e714d; text-align: center; line-height: 1.4;">
            If you did not request this security code, someone may be attempting to access your portal. Please check your credentials immediately.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Gateway] Successfully delivered OTP email to ${toEmail}. Message ID: ${info.messageId}`);
    return { delivered: true };
  } catch (err: any) {
    console.error(`[Email Gateway] Failed to send email to ${toEmail}:`, err);
    return { delivered: false, error: err.message };
  }
}
