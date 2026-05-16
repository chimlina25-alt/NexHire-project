import nodemailer from "nodemailer";

function createTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD");
  }

  return {
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    }),
    from: process.env.GMAIL_FROM || gmailUser,
  };
}

// ── Unchanged ─────────────────────────────────────────────────────────────────
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

// ++ ADDED
export async function sendSuspensionEmail(email: string) {
  const { transporter, from } = createTransporter();

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your NexHire Account Has Been Suspended",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="text-align:center; margin-bottom:24px;">
          <h2 style="color:#00a37b; margin:0;">NexHire</h2>
        </div>
        <div style="background:#fff5f5; border:1px solid #fecaca; border-radius:12px; padding:24px; margin-bottom:24px;">
          <h3 style="color:#dc2626; margin:0 0 12px;">Account Suspended</h3>
          <p style="color:#374151; margin:0; line-height:1.6;">
            Your NexHire account has been suspended by an administrator.
            You will not be able to log in until your account is reactivated.
          </p>
        </div>
        <p style="color:#374151; line-height:1.6;">
          If you believe this is a mistake or would like to appeal, please contact our support team:
        </p>
        <div style="text-align:center; margin:24px 0;">
          <a href="mailto:support@nexhire.com"
            style="display:inline-block; background:#00a37b; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600;">
            Contact Support
          </a>
        </div>
        <p style="color:#6b7280; font-size:13px; text-align:center;">
          Or email us directly at support@nexhire.com
        </p>
      </div>
    `,
  });
}

// ++ ADDED
export async function sendAccountDeletedEmail(email: string) {
  const { transporter, from } = createTransporter();

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your NexHire Account Has Been Deleted",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="text-align:center; margin-bottom:24px;">
          <h2 style="color:#00a37b; margin:0;">NexHire</h2>
        </div>
        <div style="background:#fff5f5; border:1px solid #fecaca; border-radius:12px; padding:24px; margin-bottom:24px;">
          <h3 style="color:#dc2626; margin:0 0 12px;">Account Deleted</h3>
          <p style="color:#374151; margin:0; line-height:1.6;">
            Your NexHire account and all associated data have been permanently
            deleted by an administrator.
          </p>
        </div>
        <p style="color:#374151; line-height:1.6;">
          If you believe this was done in error, please contact our support team:
        </p>
        <div style="text-align:center; margin:24px 0;">
          <a href="mailto:support@nexhire.com"
            style="display:inline-block; background:#00a37b; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600;">
            Contact Support
          </a>
        </div>
        <p style="color:#6b7280; font-size:13px; text-align:center;">
          Or email us directly at support@nexhire.com
        </p>
      </div>
    `,
  });
}
export async function sendReactivationEmail(email: string) {
  const { transporter, from } = createTransporter();

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your NexHire Account Has Been Reactivated",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="text-align:center; margin-bottom:24px;">
          <h2 style="color:#00a37b; margin:0;">NexHire</h2>
        </div>
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:24px; margin-bottom:24px;">
          <h3 style="color:#16a34a; margin:0 0 12px;">Account Reactivated</h3>
          <p style="color:#374151; margin:0; line-height:1.6;">
            Your NexHire account has been reactivated by an administrator.
            You can now log in and use your account as normal.
          </p>
        </div>
        <div style="text-align:center; margin:24px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nexhire.com"}/login"
            style="display:inline-block; background:#00a37b; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600;">
            Log In Now
          </a>
        </div>
        <p style="color:#6b7280; font-size:13px; text-align:center;">
          If you have any questions, contact us at support@nexhire.com
        </p>
      </div>
    `,
  });
}