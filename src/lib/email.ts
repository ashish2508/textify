import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  await transporter.sendMail({
    from: `"Textify" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Textify Login OTP",
    html: `
      <div style="font-family: monospace; padding: 20px; background: #fff; border: 3px solid #000; max-width: 400px;">
        <h2 style="border-bottom: 3px solid #000; padding-bottom: 10px;">Textify OTP</h2>
        <p>Your one-time password is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #fef08a; border: 3px solid #000; padding: 15px; text-align: center; box-shadow: 4px 4px 0px #000;">
          ${otp}
        </div>
        <p style="margin-top: 15px; font-size: 14px;">This code expires in 5 minutes. You have 3 attempts.</p>
      </div>
    `,
  });
}

export function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}
