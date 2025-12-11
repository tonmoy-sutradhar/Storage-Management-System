// import nodemailer from "nodemailer";

// // Create transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // Verify transporter
// transporter.verify(function (error, success) {
//   if (error) {
//     console.error("SMTP Connection Error:", error);
//   } else {
//     console.log("SMTP Server is ready to take our messages");
//   }
// });

// // Send verification email
// export const sendVerificationEmail = async (email, verificationUrl) => {
//   const mailOptions = {
//     from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
//     to: email,
//     subject: "Verify Your Email - Storage Management System",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #3b82f6;">Verify Your Email</h2>
//         <p>Thank you for registering with our Storage Management System!</p>
//         <p>Please click the button below to verify your email address:</p>
//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${verificationUrl}"
//              style="background-color: #3b82f6; color: white; padding: 12px 24px;
//                     text-decoration: none; border-radius: 5px; font-weight: bold;">
//             Verify Email
//           </a>
//         </div>
//         <p>If the button doesn't work, you can copy and paste this link:</p>
//         <p style="word-break: break-all;">${verificationUrl}</p>
//         <p>This link will expire in 24 hours.</p>
//         <p>If you didn't create an account, you can safely ignore this email.</p>
//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
//         <p style="color: #6b7280; font-size: 12px;">
//           © ${new Date().getFullYear()} Storage Management System. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// // Send password reset email
// export const sendPasswordResetEmail = async (email, resetUrl) => {
//   const mailOptions = {
//     from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
//     to: email,
//     subject: "Reset Your Password - Storage Management System",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #3b82f6;">Reset Your Password</h2>
//         <p>We received a request to reset your password.</p>
//         <p>Please click the button below to reset your password:</p>
//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${resetUrl}"
//              style="background-color: #3b82f6; color: white; padding: 12px 24px;
//                     text-decoration: none; border-radius: 5px; font-weight: bold;">
//             Reset Password
//           </a>
//         </div>
//         <p>If the button doesn't work, you can copy and paste this link:</p>
//         <p style="word-break: break-all;">${resetUrl}</p>
//         <p>This link will expire in 10 minutes.</p>
//         <p>If you didn't request a password reset, you can safely ignore this email.</p>
//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
//         <p style="color: #6b7280; font-size: 12px;">
//           © ${new Date().getFullYear()} Storage Management System. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// // Send welcome email
// export const sendWelcomeEmail = async (email, name) => {
//   const mailOptions = {
//     from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
//     to: email,
//     subject: "Welcome to Storage Management System!",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #3b82f6;">Welcome, ${name}!</h2>
//         <p>Thank you for joining our Storage Management System!</p>
//         <p>You now have <strong>15GB</strong> of free storage to upload and manage your files.</p>
//         <p>Here are some things you can do:</p>
//         <ul>
//           <li>Upload images, PDFs, and documents</li>
//           <li>Create folders to organize your files</li>
//           <li>Mark important files as favorites</li>
//           <li>Share files with others</li>
//           <li>Track your storage usage</li>
//         </ul>
//         <p>If you have any questions, feel free to contact our support team.</p>
//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
//         <p style="color: #6b7280; font-size: 12px;">
//           © ${new Date().getFullYear()} Storage Management System. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// // Send storage alert email
// export const sendStorageAlertEmail = async (email, name, usagePercentage) => {
//   const mailOptions = {
//     from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
//     to: email,
//     subject: "Storage Alert - Storage Management System",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #ef4444;">Storage Alert</h2>
//         <p>Hi ${name},</p>
//         <p>Your storage usage has reached <strong>${usagePercentage}%</strong>.</p>
//         <p>You might want to consider:</p>
//         <ul>
//           <li>Deleting unused files</li>
//           <li>Emptying the trash</li>
//           <li>Upgrading your storage plan</li>
//         </ul>
//         <p>You can manage your storage from your dashboard.</p>
//         <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
//         <p style="color: #6b7280; font-size: 12px;">
//           © ${new Date().getFullYear()} Storage Management System. All rights reserved.
//         </p>
//       </div>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };

// export default transporter;

// ------------------------
import nodemailer from "nodemailer";

// Check if SMTP credentials are set
const areSmtpCredentialsSet = () => {
  return (
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
};

// Create transporter with Gmail-specific settings
const createTransporter = () => {
  if (!areSmtpCredentialsSet()) {
    console.log(
      "⚠️  SMTP credentials not set. Email service will run in mock mode."
    );
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // For development only
    },
  });

  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.log("❌ SMTP Connection Failed:", error.message);
      console.log("📌 Troubleshooting Tips:");
      console.log("   1. Check if SMTP credentials are correct in .env file");
      console.log(
        "   2. Make sure you're using an App Password (not your regular Gmail password)"
      );
      console.log("   3. Enable 2-Step Verification and generate App Password");
      console.log("   4. Check if Gmail account allows less secure apps");
      console.log("   5. Check your internet connection");
      console.log("📧 Email service will run in mock mode for now.");
    } else {
      console.log("✅ SMTP Server is ready to send emails");
    }
  });

  return transporter;
};

const transporter = createTransporter();

// Function to check if we can send real emails
const canSendRealEmails = () => {
  return transporter && process.env.NODE_ENV === "production";
};

// Send verification email
export const sendVerificationEmail = async (email, verificationUrl) => {
  console.log(`📧 Email Verification for: ${email}`);
  console.log(`🔗 Verification URL: ${verificationUrl}`);

  if (canSendRealEmails()) {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: "Verify Your Email - Storage Management System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Verify Your Email</h2>
            <p>Thank you for registering with our Storage Management System!</p>
            <p>Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              © ${new Date().getFullYear()} Storage Management System. All rights reserved.
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(
        `✅ Email sent to ${email} with message ID: ${info.messageId}`
      );
      return info;
    } catch (error) {
      console.error(`❌ Failed to send email to ${email}:`, error.message);
      console.log("📌 Using mock mode for this email.");
      // Don't throw error, just log it
    }
  } else {
    console.log("📧 [DEV MODE] Email would be sent to:", email);
    console.log("📧 [DEV MODE] Verification URL:", verificationUrl);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log(`📧 Password Reset for: ${email}`);
  console.log(`🔗 Reset URL: ${resetUrl}`);

  if (canSendRealEmails()) {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: "Reset Your Password - Storage Management System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Reset Your Password</h2>
            <p>We received a request to reset your password.</p>
            <p>Please click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              © ${new Date().getFullYear()} Storage Management System. All rights reserved.
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send password reset email:`, error.message);
      console.log("📌 Using mock mode for this email.");
    }
  } else {
    console.log("📧 [DEV MODE] Password reset email would be sent to:", email);
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  console.log(`📧 Welcome email for: ${email} (${name})`);

  if (canSendRealEmails()) {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: "Welcome to Storage Management System!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Welcome, ${name}!</h2>
            <p>Thank you for joining our Storage Management System!</p>
            <p>You now have <strong>15GB</strong> of free storage to upload and manage your files.</p>
            <p>Here are some things you can do:</p>
            <ul>
              <li>Upload images, PDFs, and documents</li>
              <li>Create folders to organize your files</li>
              <li>Mark important files as favorites</li>
              <li>Share files with others</li>
              <li>Track your storage usage</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              © ${new Date().getFullYear()} Storage Management System. All rights reserved.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send welcome email:`, error.message);
    }
  } else {
    console.log("📧 [DEV MODE] Welcome email would be sent to:", email);
  }
};

// Send storage alert email
export const sendStorageAlertEmail = async (email, name, usagePercentage) => {
  console.log(`📧 Storage alert for: ${email} (${usagePercentage}% usage)`);

  if (canSendRealEmails()) {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: "Storage Alert - Storage Management System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Storage Alert</h2>
            <p>Hi ${name},</p>
            <p>Your storage usage has reached <strong>${usagePercentage}%</strong>.</p>
            <p>You might want to consider:</p>
            <ul>
              <li>Deleting unused files</li>
              <li>Emptying the trash</li>
              <li>Upgrading your storage plan</li>
            </ul>
            <p>You can manage your storage from your dashboard.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              © ${new Date().getFullYear()} Storage Management System. All rights reserved.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Storage alert sent to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send storage alert:`, error.message);
    }
  } else {
    console.log("📧 [DEV MODE] Storage alert would be sent to:", email);
  }
};

export default transporter;
