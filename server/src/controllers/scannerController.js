const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll } = require('../config/database');

// Scan QR code and log attendance
const scanQRCode = async (req, res, next) => {
  try {
    const { qr_data, scan_type = 'check-in', scan_location, notes } = req.body;
    const scannedBy = req.admin?.id || null;

    if (!qr_data) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Parse QR code data (format: memberID|badgeNumber)
    const [memberId, badgeNumber] = qr_data.split('|');

    if (!memberId || !badgeNumber) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    // Get member details
    const member = await dbGet(
      `SELECT m.*, c.club_name, c.zone
       FROM members m
       JOIN clubs c ON m.club_id = c.id
       WHERE m.id = ? AND m.badge_number = ?`,
      [memberId, badgeNumber]
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found or invalid badge'
      });
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingCheckIn = await dbGet(
      `SELECT * FROM attendance_logs
       WHERE member_id = ?
       AND scan_type = 'check-in'
       AND DATE(scanned_at) = ?`,
      [memberId, today]
    );

    // Create attendance log
    const logId = uuidv4();
    await dbRun(
      `INSERT INTO attendance_logs (id, member_id, scan_type, scanned_by, scan_location, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [logId, memberId, scan_type, scannedBy, scan_location || null, notes || null]
    );

    res.json({
      success: true,
      message: existingCheckIn
        ? `Welcome back, ${member.first_name}! Already checked in today.`
        : `Welcome, ${member.first_name}! Check-in successful.`,
      data: {
        member: {
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          club: member.club_name,
          zone: member.zone,
          badge_number: member.badge_number,
          callsign: member.callsign,
          position: member.position,
          email: member.email,
          contact_number: member.contact_number
        },
        attendance: {
          scan_type,
          scanned_at: new Date().toISOString(),
          already_checked_in: !!existingCheckIn
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total registered members
    const totalMembers = await dbGet(
      'SELECT COUNT(*) as count FROM members'
    );

    // Total checked in today
    const checkedInToday = await dbGet(
      `SELECT COUNT(DISTINCT member_id) as count FROM attendance_logs
       WHERE scan_type = 'check-in' AND DATE(scanned_at) = ?`,
      [today]
    );

    // Check-ins by zone
    const byZone = await dbAll(
      `SELECT c.zone, COUNT(DISTINCT a.member_id) as count
       FROM attendance_logs a
       JOIN members m ON a.member_id = m.id
       JOIN clubs c ON m.club_id = c.id
       WHERE a.scan_type = 'check-in' AND DATE(a.scanned_at) = ?
       GROUP BY c.zone
       ORDER BY count DESC`,
      [today]
    );

    // Recent scans (last 20)
    const recentScans = await dbAll(
      `SELECT a.*, m.first_name, m.last_name, m.badge_number, c.club_name, c.zone
       FROM attendance_logs a
       JOIN members m ON a.member_id = m.id
       JOIN clubs c ON m.club_id = c.id
       ORDER BY a.scanned_at DESC
       LIMIT 20`
    );

    res.json({
      success: true,
      data: {
        total_members: totalMembers.count,
        checked_in_today: checkedInToday.count,
        attendance_rate: totalMembers.count > 0
          ? ((checkedInToday.count / totalMembers.count) * 100).toFixed(2)
          : 0,
        by_zone: byZone,
        recent_scans: recentScans.map(scan => ({
          id: scan.id,
          member_name: `${scan.first_name} ${scan.last_name}`,
          badge_number: scan.badge_number,
          club_name: scan.club_name,
          zone: scan.zone,
          scan_type: scan.scan_type,
          scanned_at: scan.scanned_at
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get member attendance history
const getMemberAttendance = async (req, res, next) => {
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

    const attendance = await dbAll(
      `SELECT * FROM attendance_logs
       WHERE member_id = ?
       ORDER BY scanned_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        member: {
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          club: member.club_name,
          zone: member.zone,
          badge_number: member.badge_number
        },
        attendance_logs: attendance
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export attendance report
const exportAttendance = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const attendance = await dbAll(
      `SELECT
        m.badge_number,
        m.first_name,
        m.last_name,
        m.email,
        m.contact_number,
        m.callsign,
        m.position,
        c.club_name,
        c.zone,
        a.scan_type,
        a.scanned_at,
        a.scan_location
       FROM attendance_logs a
       JOIN members m ON a.member_id = m.id
       JOIN clubs c ON m.club_id = c.id
       WHERE DATE(a.scanned_at) = ?
       ORDER BY a.scanned_at ASC`,
      [targetDate]
    );

    res.json({
      success: true,
      data: {
        date: targetDate,
        total_scans: attendance.length,
        attendance
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanQRCode,
  getAttendanceStats,
  getMemberAttendance,
  exportAttendance
};
