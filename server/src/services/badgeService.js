const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create badges directory if it doesn't exist
const badgesDir = path.join(process.env.UPLOAD_DIR || './uploads', 'badges');
if (!fs.existsSync(badgesDir)) {
  fs.mkdirSync(badgesDir, { recursive: true });
}

/**
 * Generate a unique badge number
 * Format: PR2025-XXXXX (where XXXXX is a random 5-digit number)
 */
const generateBadgeNumber = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PR2025-${randomNum}`;
};

/**
 * Generate QR code for member badge
 * @param {Object} member - Member object with all details
 * @param {Object} club - Club object
 * @returns {Promise<string>} - Path to generated QR code
 */
const generateQRCode = async (member, club) => {
  try {
    // Create QR code data - use simple string format instead of JSON to reduce size
    // Format: MEMBERID|BADGENUMBER
    const qrData = `${member.id}|${member.badge_number}`;

    // Generate unique filename
    const filename = `${member.badge_number}.png`;
    const filepath = path.join(badgesDir, filename);

    // Generate QR code with options
    await QRCode.toFile(filepath, qrData, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'L', // Lowest error correction = smaller data
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return `/uploads/badges/${filename}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Generate QR code as data URL (for immediate display)
 * @param {Object} member - Member object with all details
 * @param {Object} club - Club object
 * @returns {Promise<string>} - Data URL of QR code
 */
const generateQRCodeDataURL = async (member, club) => {
  try {
    // Create QR code data - use simple string format instead of JSON to reduce size
    // Format: MEMBERID|BADGENUMBER
    const qrData = `${member.id}|${member.badge_number}`;

    const dataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'L', // Lowest error correction = smaller data
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return dataURL;
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    throw error;
  }
};

/**
 * Generate complete member badge with QR code
 * @param {Object} member - Member object
 * @param {Object} club - Club object
 * @returns {Promise<Object>} - Badge details with QR code path and data URL
 */
const generateMemberBadge = async (member, club) => {
  try {
    // Generate badge number if not exists
    if (!member.badge_number) {
      member.badge_number = generateBadgeNumber();
    }

    // Generate QR code file
    const qrCodePath = await generateQRCode(member, club);

    // Generate QR code data URL for immediate display
    const qrCodeDataURL = await generateQRCodeDataURL(member, club);

    return {
      badge_number: member.badge_number,
      qr_code_url: qrCodePath,
      qr_code_data_url: qrCodeDataURL,
      member_name: `${member.first_name} ${member.last_name}`,
      club_name: club.club_name,
      callsign: member.callsign,
      position: member.position,
      event_name: process.env.EVENT_NAME,
      event_date: process.env.EVENT_DATE,
      event_time: process.env.EVENT_TIME,
      event_location: process.env.EVENT_LOCATION
    };
  } catch (error) {
    console.error('Error generating member badge:', error);
    throw error;
  }
};

module.exports = {
  generateBadgeNumber,
  generateQRCode,
  generateQRCodeDataURL,
  generateMemberBadge
};
