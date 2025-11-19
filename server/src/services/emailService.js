const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const { dbRun } = require("../config/database");

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const logEmail = async (emailData) => {
  try {
    const logId = uuidv4();
    await dbRun(
      `INSERT INTO email_logs (id, club_id, member_id, email_type, recipient_email, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        logId,
        emailData.club_id || null,
        emailData.member_id || null,
        emailData.email_type,
        emailData.recipient_email,
        "pending",
      ]
    );
    return logId;
  } catch (error) {
    console.error("Error logging email:", error);
    return null;
  }
};

const updateEmailLog = async (logId, status, errorMessage = null) => {
  try {
    await dbRun(
      `UPDATE email_logs SET status = ?, error_message = ? WHERE id = ?`,
      [status, errorMessage, logId]
    );
  } catch (error) {
    console.error("Error updating email log:", error);
  }
};

const sendEmail = async (
  to,
  subject,
  html,
  emailType,
  clubId = null,
  memberId = null
) => {
  const logId = await logEmail({
    club_id: clubId,
    member_id: memberId,
    email_type: emailType,
    recipient_email: to,
  });

  try {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME,
      },
      subject,
      html,
    };

    await sgMail.send(msg);

    if (logId) {
      await updateEmailLog(logId, "sent");
    }

    return { success: true, logId };
  } catch (error) {
    console.error("Error sending email:", error);

    if (logId) {
      await updateEmailLog(logId, "failed", error.message);
    }

    return { success: false, error: error.message, logId };
  }
};

const sendEmailWithAttachment = async (
  to,
  subject,
  html,
  qrCodeDataUrl,
  emailType,
  clubId = null,
  memberId = null
) => {
  const logId = await logEmail({
    club_id: clubId,
    member_id: memberId,
    email_type: emailType,
    recipient_email: to,
  });

  try {
    // Extract base64 data from data URL
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME,
      },
      subject,
      html,
      attachments: [
        {
          content: base64Data,
          filename: "qr-code-badge.png",
          type: "image/png",
          disposition: "inline",
          content_id: "qrcode",
        },
      ],
    };

    await sgMail.send(msg);

    if (logId) {
      await updateEmailLog(logId, "sent");
    }

    return { success: true, logId };
  } catch (error) {
    console.error("Error sending email with attachment:", error);

    if (logId) {
      await updateEmailLog(logId, "failed", error.message);
    }

    return { success: false, error: error.message, logId };
  }
};

// Email templates
const getPaymentInstructions = () => {
  return `
    <h3>Payment Instructions</h3>
    <p><strong>Registration Fee: ₱4,000.00</strong></p>

    <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <h4>BDO Bank Transfer</h4>
      <p>
        <strong>Account Name:</strong> Rotary Club of Marikina Hilltop<br>
        <strong>Account Number:</strong> 0021 5802 5770
      </p>
    </div>

    <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <h4>GCash Payment</h4>
      <p>
        <strong>Account Name:</strong> Karl Marcus Montaner<br>
        <strong>Mobile Number:</strong> 0917 522 5275
      </p>
    </div>

    <p><strong>Important:</strong> Please upload your proof of payment within 4 hours to secure your registration.</p>
  `;
};

const sendClubRegistrationConfirmation = async (club) => {
  const subject = `Registration Confirmation - ${process.env.EVENT_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #fe0808;">Welcome to ${process.env.EVENT_NAME}!</h2>

      <p>Dear ${club.contact_person},</p>

      <p>Thank you for registering <strong>${club.club_name}</strong> for ${
    process.env.EVENT_NAME
  }!</p>

      <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0;">Event Details</h3>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${
          process.env.EVENT_DATE
        }</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${
          process.env.EVENT_TIME
        }</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${
          process.env.EVENT_LOCATION
        }</p>
      </div>

      ${getPaymentInstructions()}

      <p>After uploading your proof of payment, your registration will be reviewed and approved by our admin team.</p>

      <p>If you have any questions, please don't hesitate to contact us.</p>

      <p>Best regards,<br>
      ${process.env.EVENT_NAME} Organizing Committee</p>
    </div>
  `;

  return await sendEmail(
    club.email,
    subject,
    html,
    "registration_confirmation",
    club.id
  );
};

const sendPaymentReminder = async (club) => {
  const subject = `Payment Reminder - ${process.env.EVENT_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #fe0808;">Payment Reminder</h2>

      <p>Dear ${club.contact_person},</p>

      <p>This is a friendly reminder that we haven't received your proof of payment for <strong>${
        club.club_name
      }</strong>'s registration.</p>

      ${getPaymentInstructions()}

      <p>Please upload your proof of payment as soon as possible to complete your registration.</p>

      <p>Thank you!</p>

      <p>Best regards,<br>
      ${process.env.EVENT_NAME} Organizing Committee</p>
    </div>
  `;

  return await sendEmail(
    club.email,
    subject,
    html,
    "payment_reminder",
    club.id
  );
};

const sendApprovalNotification = async (club) => {
  const subject = `Registration Approved - ${process.env.EVENT_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">Registration Approved!</h2>

      <p>Dear ${club.contact_person},</p>

      <p>Great news! Your registration for <strong>${club.club_name}</strong> has been approved!</p>

      <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745;">
        <h3 style="margin-top: 0;">Next Steps</h3>
        <p>You can now proceed to register your club members for the event.</p>
        <p><a href="${process.env.FRONTEND_URL}/register-member" style="color: #fe0808; text-decoration: none; font-weight: bold;">Register Members Now →</a></p>
      </div>

      <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0;">Event Details</h3>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${process.env.EVENT_DATE}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${process.env.EVENT_TIME}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${process.env.EVENT_LOCATION}</p>
      </div>

      <p>We look forward to seeing you at the event!</p>

      <p>Best regards,<br>
      ${process.env.EVENT_NAME} Organizing Committee</p>
    </div>
  `;

  return await sendEmail(
    club.email,
    subject,
    html,
    "approval_notification",
    club.id
  );
};

const sendRejectionNotification = async (club) => {
  const subject = `Registration Update - ${process.env.EVENT_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #fe0808;">Registration Update</h2>

      <p>Dear ${club.contact_person},</p>

      <p>We regret to inform you that your registration for <strong>${
        club.club_name
      }</strong> could not be approved at this time.</p>

      ${
        club.rejection_reason
          ? `
        <div style="background-color: #f8d7da; padding: 15px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="margin-top: 0;">Reason</h3>
          <p>${club.rejection_reason}</p>
        </div>
      `
          : ""
      }

      <p>If you believe this is an error or would like to discuss this further, please contact us.</p>

      <p>Best regards,<br>
      ${process.env.EVENT_NAME} Organizing Committee</p>
    </div>
  `;

  return await sendEmail(
    club.email,
    subject,
    html,
    "rejection_notification",
    club.id
  );
};

const sendMemberBadge = async (member, club, badge) => {
  const subject = `Your Digital Badge - ${process.env.EVENT_NAME}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #fe0808;">Registration Successful!</h2>

      <p>Dear ${member.first_name} ${member.last_name},</p>

      <p>Thank you for registering for ${process.env.EVENT_NAME}!</p>

      <div style="background-color: #d4edda; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745; text-align: center;">
        <h3 style="margin-top: 0;">Your Registration Details</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${member.first_name} ${
    member.last_name
  }</p>
        <p style="margin: 5px 0;"><strong>Club:</strong> ${club.club_name}</p>
        <p style="margin: 5px 0;"><strong>Badge Number:</strong> ${
          member.badge_number
        }</p>
        ${
          member.callsign
            ? `<p style="margin: 5px 0;"><strong>Callsign:</strong> ${member.callsign}</p>`
            : ""
        }
        ${
          member.position
            ? `<p style="margin: 5px 0;"><strong>Position:</strong> ${member.position}</p>`
            : ""
        }
      </div>

      <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="margin-top: 0;">Event Details</h3>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${
          process.env.EVENT_DATE
        }</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${
          process.env.EVENT_TIME
        }</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${
          process.env.EVENT_LOCATION
        }</p>
      </div>

      <div style="text-align: center; margin: 30px 0; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #fe0808;">Your Digital Badge QR Code</h3>
        <p style="color: #666; margin-bottom: 20px;">Please present this at the registration desk on the event day.</p>
        <img src="cid:qrcode" alt="QR Code Badge" style="max-width: 300px; border: 2px solid #ddd; border-radius: 8px; padding: 10px; background: white;" />
        <p style="font-size: 18px; font-weight: bold; margin-top: 15px; color: #333;">${
          member.badge_number
        }</p>
      </div>

      <div style="background-color: #e7f3ff; padding: 15px; margin: 20px 0; border-left: 4px solid #0066cc; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px;"><strong>💡 Tip:</strong> Save this email or download the QR code to your phone for easy access on the event day.</p>
      </div>

      <p>We look forward to seeing you at the event!</p>

      <p>Best regards,<br>
      ${process.env.EVENT_NAME} Organizing Committee</p>
    </div>
  `;

  // Send email with QR code embedded as attachment
  return await sendEmailWithAttachment(
    member.email,
    subject,
    html,
    badge.qr_code_data_url,
    "badge_delivery",
    null,
    member.id
  );
};

module.exports = {
  sendClubRegistrationConfirmation,
  sendPaymentReminder,
  sendApprovalNotification,
  sendRejectionNotification,
  sendMemberBadge,
};
