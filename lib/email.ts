import nodemailer from "nodemailer";

export async function sendOtpEmail(
  email: string,
  code: string,
  subject: string
) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_FROM || gmailUser,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#00a37b;">${subject}</h2>
        <p>Your verification code is:</p>
        <div style="font-size:34px;font-weight:700;letter-spacing:8px;margin:24px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });
}
