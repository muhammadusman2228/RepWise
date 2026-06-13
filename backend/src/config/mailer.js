import nodemailer from "nodemailer";
import config from "./config.js";

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_SECURE,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (userEmail, name, token) => {
  const verificationLink = `${config.BACKEND_URL}/api/verifyMe?token=${token}`;

  const mailOptions = {
    from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM || config.EMAIL_USER}>`,
    to: userEmail,
    subject: "Confirm your RepWise account",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Hello ${name},</h2>

        <p>Thank you for signing up for RepWise. Please verify your email address to activate your account:</p>

        <a 
          href="${verificationLink}" 
          style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;"
        >
          Verify My Account
        </a>

        <p>This verification link will expire in 24 hours.</p>

        <hr style="border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; color: #777;">
          If you did not sign up for this application, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export { sendVerificationEmail };
