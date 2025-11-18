const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { generateMemberBadge, generateBadgeNumber } = require('../services/badgeService');
const { sendMemberBadge } = require('../services/emailService');

// Public: Register a new member
const registerMember = async (req, res, next) => {
  try {
    const { club_id, first_name, last_name, contact_number, email, callsign, position } = req.body;

    // Validation
    if (!club_id || !first_name || !last_name || !contact_number || !email) {
      return res.status(400).json({
        success: false,
        message: 'Club, first name, last name, contact number, and email are required'
      });
    }

    // Check if club exists and is approved
    const club = await dbGet(
      'SELECT * FROM clubs WHERE id = ? AND payment_status = ?',
      [club_id, 'approved']
    );

    if (!club) {
      return res.status(400).json({
        success: false,
        message: 'Club not found or not yet approved. Please ensure the club has completed registration and payment.'
      });
    }

    // Check if member already registered
    const existingMember = await dbGet(
      'SELECT id FROM members WHERE email = ? AND club_id = ?',
      [email, club_id]
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered for this club'
      });
    }

    const memberId = uuidv4();
    const badgeNumber = generateBadgeNumber();

    // Insert member
    await dbRun(
      `INSERT INTO members (id, club_id, first_name, last_name, contact_number, email, callsign, position, badge_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [memberId, club_id, first_name, last_name, contact_number, email, callsign || null, position || null, badgeNumber]
    );

    const member = await dbGet('SELECT * FROM members WHERE id = ?', [memberId]);

    // Generate badge with QR code
    const badge = await generateMemberBadge(member, club);

    // Update member with QR code URL
    await dbRun(
      'UPDATE members SET qr_code_url = ?, badge_generated = 1 WHERE id = ?',
      [badge.qr_code_url, memberId]
    );

    // Send badge via email with QR code
    await sendMemberBadge(member, club, badge);

    // Mark badge as sent
    await dbRun('UPDATE members SET badge_sent = 1 WHERE id = ?', [memberId]);

    res.status(201).json({
      success: true,
      message: 'Member registered successfully! Your digital badge has been sent to your email.',
      data: {
        member_id: memberId,
        badge_number: badgeNumber,
        badge: badge
      }
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get member badge
const getMemberBadge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await dbGet('SELECT * FROM members WHERE id = ?', [id]);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const club = await dbGet('SELECT * FROM clubs WHERE id = ?', [member.club_id]);

    const badge = await generateMemberBadge(member, club);

    res.json({
      success: true,
      data: badge
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get member details
const getMemberDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await dbGet(
      `SELECT m.*, c.club_name, c.zone
       FROM members m
       JOIN clubs c ON m.club_id = c.id
       WHERE m.id = ?`,
      [id]
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerMember,
  getMemberBadge,
  getMemberDetails
};
