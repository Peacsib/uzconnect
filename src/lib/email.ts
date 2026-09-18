import nodemailer from "nodemailer";

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  otpCode,
}: {
  to: string;
  name: string;
  resetUrl: string;
  otpCode: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || '"University of Zimbabwe (WRL Connect)" <noreply@uz.ac.zw>';

  console.log(`[Password Reset] Preparing email for ${to} with OTP: ${otpCode}`);

  // If SMTP is configured in .env, send real email
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject: "Password Reset Code - UZ WRL Connect",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #003366; margin: 0; font-size: 24px;">University of Zimbabwe</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Work Related Learning (WRL) Portal</p>
            </div>
            
            <p style="font-size: 15px; color: #1e293b;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              A password reset was requested for your UZ WRL Connect account. Use the 6-digit verification code below to set your new password:
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; padding: 14px 28px; background: #003366; color: #ffffff; font-size: 28px; font-weight: bold; font-family: monospace; letter-spacing: 6px; border-radius: 8px;">
                ${otpCode}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 1 hour</p>
            </div>

            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Alternatively, you can click the direct reset link below:
            </p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #ff8c00; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 6px;">
                Reset My Password
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              If you did not request this password reset, please disregard this email. Your password will remain unchanged.
            </p>
          </div>
        `,
      });

      console.log(`[Password Reset] Real email sent successfully: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("[Password Reset] SMTP delivery failed:", err.message);
      // Fallback to simulated delivery so user is not blocked
    }
  }

  // Fallback: log to console
  console.log("=================================================");
  console.log("📧 PASSWORD RESET EMAIL SIMULATION (Local Dev)");
  console.log(`To: ${to} (${name})`);
  console.log(`OTP Code: ${otpCode}`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log("=================================================");

  return { success: true, simulated: true };
}
