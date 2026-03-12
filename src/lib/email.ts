import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return;
    }
    console.error("SMTP configuration missing! Check SMTP_HOST, SMTP_USER, SMTP_PASS");
    throw new Error("Email service not configured");
  }

  try {
    await transporter.sendMail({
      from: `"Textify" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Textify Login OTP",
      html: `
      <div style="font-family: 'Courier New', monospace; padding: 0; background: #e8f4f0; max-width: 460px; margin: 0 auto;">
        <div style="background: #e63946; border: 4px solid #000; padding: 18px 24px; box-shadow: 6px 6px 0px #000;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #000;">
            ⚡ Textify
          </h1>
        </div>

        <div style="background: #ffffff; border: 4px solid #000; border-top: none; padding: 30px 24px;">
          <p style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px 0; color: #000;">
            Your one-time password
          </p>

          <div style="background: #3a86ff; border: 4px solid #000; padding: 20px; text-align: center; box-shadow: 6px 6px 0px #000; margin-bottom: 24px;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #fff; font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>

          <div style="background: #2dc653; border: 3px solid #000; padding: 12px 16px; box-shadow: 4px 4px 0px #000;">
            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">
              ⏱ Expires in 5 minutes &nbsp;|&nbsp; 🔒 3 attempts max
            </p>
          </div>

          <p style="margin: 20px 0 0 0; font-size: 12px; font-weight: 600; color: #000; opacity: 0.5;">
            If you didn't request this code, ignore this email.
          </p>
        </div>

        <div style="background: #000; padding: 12px 24px; border: 4px solid #000;">
          <p style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #e8f4f0;">
            Textify — Real-time Multilingual Chat
          </p>
        </div>
      </div>
    `,
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw error;
  }
}

export function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}
