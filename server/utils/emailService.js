const nodemailer = require("nodemailer");

/**
 * Creates and returns a Nodemailer transporter.
 * If SMTP_HOST, SMTP_USER, and SMTP_PASS exist in process.env, uses production SMTP settings.
 * Otherwise, automatically provisions a Nodemailer Ethereal test account.
 */
async function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    return {
      transporter,
      isTestAccount: false,
      fromAddress: SMTP_USER,
    };
  }

  // Fallback to Nodemailer Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return {
    transporter,
    isTestAccount: true,
    fromAddress: testAccount.user,
  };
}

/**
 * Generates a clean, modern HTML email template for project invitations.
 */
function generateInviteHtml({ toEmail, inviteLink, inviterName, role }) {
  const safeInviter = inviterName || "A team administrator";
  const safeRole = role || "User";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Corporate Task Tracker</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f1f5f9;
    }
    .wrapper {
      width: 100%;
      background-color: #0f172a;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 36px 32px;
      background-color: #1e293b;
    }
    .content h2 {
      margin-top: 0;
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 16px 0;
    }
    .badge-box {
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    .button-container {
      text-align: center;
      margin: 32px 0 24px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .fallback-url {
      font-size: 12px;
      color: #94a3b8;
      word-break: break-all;
      background-color: #0f172a;
      padding: 12px;
      border-radius: 8px;
      border: 1px dashed #334155;
      margin-top: 20px;
    }
    .footer {
      border-top: 1px solid #334155;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      background-color: #172033;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Corporate Task Tracker</h1>
      </div>
      <div class="content">
        <h2>You're Invited to Join!</h2>
        <p>Hello,</p>
        <p><strong>${safeInviter}</strong> has invited you to join the team workspace on <strong>Corporate Task Tracker</strong>.</p>
        
        <div class="badge-box">
          <table width="100%" cellpadding="6" cellspacing="0" border="0">
            <tr>
              <td style="color: #94a3b8; font-size: 13px;">Invited Email:</td>
              <td style="color: #f8fafc; font-weight: 600; font-size: 13px; text-align: right;">${toEmail}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 13px;">Assigned Role:</td>
              <td style="color: #a5b4fc; font-weight: 600; font-size: 13px; text-align: right;">${safeRole}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; font-size: 13px;">Invited By:</td>
              <td style="color: #f8fafc; font-weight: 600; font-size: 13px; text-align: right;">${safeInviter}</td>
            </tr>
          </table>
        </div>

        <p>Click the button below to accept your invitation, set up your account, and access your project boards:</p>
        
        <div class="button-container">
          <a href="${inviteLink}" class="button" target="_blank" rel="noopener noreferrer">
            Accept Invitation &amp; Join Workspace
          </a>
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
          If the button above does not work, copy and paste the following URL into your browser:
        </p>
        <div class="fallback-url">
          <a href="${inviteLink}" style="color: #818cf8; text-decoration: underline;">${inviteLink}</a>
        </div>
      </div>
      <div class="footer">
        <p style="margin: 0 0 6px 0;">This invitation was sent to ${toEmail}.</p>
        <p style="margin: 0;">If you were not expecting this invitation, you can safely disregard this message.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends a project invitation email using Nodemailer.
 *
 * @param {string} toEmail - Recipient email address
 * @param {string} inviteLink - URL link for accepting the invitation
 * @param {string} inviterName - Name of the user sending the invite
 * @param {string} role - Role assigned to the invited user ('User' or 'Admin')
 * @returns {Promise<Object>} Nodemailer sendMail result info object
 */
async function sendInviteEmail(toEmail, inviteLink, inviterName, role) {
  const { transporter, isTestAccount, fromAddress } = await createTransporter();

  const safeInviter = inviterName || "A team administrator";
  const safeRole = role || "User";

  const mailOptions = {
    from: `"Corporate Task Tracker" <${fromAddress}>`,
    to: toEmail,
    subject: `You've been invited to join Corporate Task Tracker by ${safeInviter}`,
    text: `Hello,\n\n${safeInviter} has invited you to join Corporate Task Tracker as a ${safeRole}.\n\nPlease click the following link to accept your invitation:\n${inviteLink}\n\nIf you were not expecting this invitation, you can safely ignore this email.\n\nBest regards,\nCorporate Task Tracker Team`,
    html: generateInviteHtml({ toEmail, inviteLink, inviterName, role }),
  };

  const info = await transporter.sendMail(mailOptions);

  if (isTestAccount) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Nodemailer Ethereal] Invitation email preview URL: ${previewUrl}`);
      info.previewUrl = previewUrl;
    }
  }

  return info;
}

module.exports = {
  sendInviteEmail,
};
module.exports.sendInviteEmail = sendInviteEmail;
module.exports.default = sendInviteEmail;
