const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { sendClubRegistrationConfirmation, sendPaymentReminder } = require('../services/emailService');

// Public: Register a new club
const registerClub = async (req, res, next) => {
  try {
    const { club_name, contact_person, contact_number, email, zone, payment_method } = req.body;

    // Validation
    if (!club_name || !contact_person || !contact_number || !email) {
      return res.status(400).json({
        success: false,
        message: 'Club name, contact person, contact number, and email are required'
      });
    }

    // Check if club already exists
    const existingClub = await dbGet(
      'SELECT id FROM clubs WHERE club_name = ?',
      [club_name]
    );

    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: 'A club with this name is already registered'
      });
    }

    const clubId = uuidv4();
    const registrationFee = parseFloat(process.env.CLUB_REGISTRATION_FEE) || 4000.00;

    await dbRun(
      `INSERT INTO clubs (id, club_name, contact_person, contact_number, email, zone, registration_fee, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clubId, club_name, contact_person, contact_number, email, zone, registrationFee, payment_method, 'pending']
    );

    const club = await dbGet('SELECT * FROM clubs WHERE id = ?', [clubId]);

    // Send confirmation email
    await sendClubRegistrationConfirmation(club);

    // Schedule payment reminder (in production, use a job queue)
    // For now, we'll handle this via a separate cron job or manual check

    res.status(201).json({
      success: true,
      message: 'Club registered successfully. Please check your email for payment instructions.',
      data: {
        club_id: clubId,
        club_name,
        email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Public: Upload proof of payment
const uploadPaymentProof = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const club = await dbGet('SELECT * FROM clubs WHERE id = ?', [id]);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    if (club.payment_status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This club has already been approved'
      });
    }

    const proofUrl = `/uploads/payments/${req.file.filename}`;

    await dbRun(
      `UPDATE clubs SET proof_of_payment_url = ?, upload_date = CURRENT_TIMESTAMP, payment_status = ? WHERE id = ?`,
      [proofUrl, 'paid', id]
    );

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully. Your registration will be reviewed by our admin team.',
      data: {
        proof_url: proofUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get payment information
const getPaymentInfo = async (req, res, next) => {
  try {
    const paymentInfo = await dbAll(
      'SELECT payment_method, account_name, account_number, mobile_number FROM payment_info WHERE is_active = 1'
    );

    res.json({
      success: true,
      data: paymentInfo
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get approved clubs (for member registration dropdown)
const getApprovedClubs = async (req, res, next) => {
  try {
    const clubs = await dbAll(
      'SELECT id, club_name, zone FROM clubs WHERE payment_status = ? ORDER BY club_name ASC',
      ['approved']
    );

    res.json({
      success: true,
      data: clubs
    });
  } catch (error) {
    next(error);
  }
};

// Public: Check club registration status
const checkClubStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const club = await dbGet(
      'SELECT id, club_name, contact_person, payment_status, created_at, approved_date, rejection_reason FROM clubs WHERE id = ?',
      [id]
    );

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    res.json({
      success: true,
      data: club
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerClub,
  uploadPaymentProof,
  getPaymentInfo,
  getApprovedClubs,
  checkClubStatus
};
