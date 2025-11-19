const { dbRun, dbGet, dbAll } = require('../config/database');
const { sendApprovalNotification, sendRejectionNotification } = require('../services/emailService');

// Dashboard - Get overview metrics
const getDashboard = async (req, res, next) => {
  try {
    // Total clubs by status
    const clubStats = await dbAll(
      `SELECT payment_status, COUNT(*) as count FROM clubs GROUP BY payment_status`
    );

    const clubsByStatus = {
      total: 0,
      pending: 0,
      paid: 0,
      approved: 0,
      rejected: 0
    };

    clubStats.forEach(stat => {
      clubsByStatus[stat.payment_status] = stat.count;
      clubsByStatus.total += stat.count;
    });

    // Total members
    const memberCount = await dbGet('SELECT COUNT(*) as count FROM members');
    const totalMembers = memberCount.count;

    // Total revenue (approved clubs only)
    const revenue = await dbGet(
      'SELECT SUM(registration_fee) as total FROM clubs WHERE payment_status = ?',
      ['approved']
    );
    const totalRevenue = revenue.total || 0;

    // Members by club (top 10)
    const membersByClub = await dbAll(
      `SELECT c.club_name, c.zone, COUNT(m.id) as member_count
       FROM clubs c
       LEFT JOIN members m ON c.id = m.club_id
       WHERE c.payment_status = 'approved'
       GROUP BY c.id
       ORDER BY member_count DESC
       LIMIT 10`
    );

    // Zones with complete payment
    const zoneStats = await dbAll(
      `SELECT zone, COUNT(*) as total_clubs,
              SUM(CASE WHEN payment_status = 'approved' THEN 1 ELSE 0 END) as approved_clubs
       FROM clubs
       WHERE zone IS NOT NULL
       GROUP BY zone`
    );

    const zonesComplete = zoneStats.filter(z => z.total_clubs === z.approved_clubs).length;

    // Recent registrations
    const recentClubs = await dbAll(
      'SELECT id, club_name, contact_person, payment_status, created_at FROM clubs ORDER BY created_at DESC LIMIT 10'
    );

    const recentMembers = await dbAll(
      `SELECT m.id, m.first_name, m.last_name, m.email, m.created_at, c.club_name
       FROM members m
       JOIN clubs c ON m.club_id = c.id
       ORDER BY m.created_at DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        clubs: clubsByStatus,
        total_members: totalMembers,
        total_revenue: totalRevenue,
        zones_complete: zonesComplete,
        members_by_club: membersByClub,
        zone_stats: zoneStats,
        recent_clubs: recentClubs,
        recent_members: recentMembers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all clubs with filters
const getAllClubs = async (req, res, next) => {
  try {
    const { status, zone, search, page = 1, limit = 20 } = req.query;

    let query = 'SELECT * FROM clubs WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND payment_status = ?';
      params.push(status);
    }

    if (zone) {
      query += ' AND zone = ?';
      params.push(zone);
    }

    if (search) {
      query += ' AND (club_name LIKE ? OR contact_person LIKE ? OR contact_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const totalResult = await dbGet(countQuery, params);
    const total = totalResult.count;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const clubs = await dbAll(query, params);

    res.json({
      success: true,
      data: {
        clubs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get club details with members
const getClubDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const club = await dbGet('SELECT * FROM clubs WHERE id = ?', [id]);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    const members = await dbAll(
      'SELECT * FROM members WHERE club_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({
      success: true,
      data: {
        club,
        members,
        member_count: members.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Approve club registration
const approveClub = async (req, res, next) => {
  try {
    const { id } = req.params;

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
        message: 'Club is already approved'
      });
    }

    if (club.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve club without payment proof'
      });
    }

    await dbRun(
      'UPDATE clubs SET payment_status = ?, approved_by = ?, approved_date = CURRENT_TIMESTAMP WHERE id = ?',
      ['approved', req.user.id, id]
    );

    const updatedClub = await dbGet('SELECT * FROM clubs WHERE id = ?', [id]);

    // Send approval notification
    await sendApprovalNotification(updatedClub);

    res.json({
      success: true,
      message: 'Club approved successfully',
      data: updatedClub
    });
  } catch (error) {
    next(error);
  }
};

// Reject club registration
const rejectClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const club = await dbGet('SELECT * FROM clubs WHERE id = ?', [id]);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    await dbRun(
      'UPDATE clubs SET payment_status = ?, rejection_reason = ? WHERE id = ?',
      ['rejected', rejection_reason, id]
    );

    const updatedClub = await dbGet('SELECT * FROM clubs WHERE id = ?', [id]);

    // Send rejection notification
    await sendRejectionNotification(updatedClub);

    res.json({
      success: true,
      message: 'Club registration rejected',
      data: updatedClub
    });
  } catch (error) {
    next(error);
  }
};

// Get all members with filters
const getAllMembers = async (req, res, next) => {
  try {
    const { club_id, search, page = 1, limit = 50 } = req.query;
    const today = new Date().toISOString().split('T')[0];

    // Build WHERE clause for filtering
    let whereClause = 'WHERE 1=1';
    const filterParams = [];

    if (club_id) {
      whereClause += ' AND m.club_id = ?';
      filterParams.push(club_id);
    }

    if (search) {
      whereClause += ' AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ? OR m.badge_number LIKE ?)';
      const searchTerm = `%${search}%`;
      filterParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Get total count (simple query without subqueries)
    const countQuery = `
      SELECT COUNT(*) as count
      FROM members m
      JOIN clubs c ON m.club_id = c.id
      ${whereClause}
    `;
    const totalResult = await dbGet(countQuery, filterParams);
    const total = totalResult.count;

    // Get members with attendance data
    const query = `
      SELECT m.*, c.club_name, c.zone,
        (SELECT COUNT(*) FROM attendance_logs a
         WHERE a.member_id = m.id AND a.scan_type = 'check-in' AND DATE(a.scanned_at) = ?) as checked_in_today,
        (SELECT MAX(scanned_at) FROM attendance_logs a
         WHERE a.member_id = m.id AND a.scan_type = 'check-in' AND DATE(a.scanned_at) = ?) as last_check_in
      FROM members m
      JOIN clubs c ON m.club_id = c.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const offset = (page - 1) * limit;
    const params = [today, today, ...filterParams, parseInt(limit), offset];

    const members = await dbAll(query, params);

    res.json({
      success: true,
      data: {
        members: members.map(member => ({
          ...member,
          has_attended: member.checked_in_today > 0
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete member
const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await dbGet('SELECT * FROM members WHERE id = ?', [id]);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    await dbRun('DELETE FROM members WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get analytics data
const getAnalytics = async (req, res, next) => {
  try {
    // Clubs by status
    const clubsByStatus = await dbAll(
      'SELECT payment_status, COUNT(*) as count FROM clubs GROUP BY payment_status'
    );

    // Clubs by zone
    const clubsByZone = await dbAll(
      'SELECT zone, COUNT(*) as count FROM clubs WHERE zone IS NOT NULL GROUP BY zone ORDER BY count DESC'
    );

    // Members by club
    const membersByClub = await dbAll(
      `SELECT c.club_name, c.zone, COUNT(m.id) as member_count
       FROM clubs c
       LEFT JOIN members m ON c.id = m.club_id
       GROUP BY c.id
       ORDER BY member_count DESC`
    );

    // Registration timeline (last 30 days)
    const registrationTimeline = await dbAll(
      `SELECT DATE(created_at) as date,
              COUNT(*) as club_count,
              (SELECT COUNT(*) FROM members WHERE DATE(created_at) = DATE(clubs.created_at)) as member_count
       FROM clubs
       WHERE created_at >= DATE('now', '-30 days')
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Revenue by zone
    const revenueByZone = await dbAll(
      `SELECT zone, SUM(registration_fee) as revenue, COUNT(*) as club_count
       FROM clubs
       WHERE payment_status = 'approved' AND zone IS NOT NULL
       GROUP BY zone
       ORDER BY revenue DESC`
    );

    res.json({
      success: true,
      data: {
        clubs_by_status: clubsByStatus,
        clubs_by_zone: clubsByZone,
        members_by_club: membersByClub,
        registration_timeline: registrationTimeline,
        revenue_by_zone: revenueByZone
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get zones list
const getZones = async (req, res, next) => {
  try {
    const zones = await dbAll(
      `SELECT zone,
              COUNT(*) as total_clubs,
              SUM(CASE WHEN payment_status = 'approved' THEN 1 ELSE 0 END) as approved_clubs,
              SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_clubs,
              SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_clubs,
              SUM(registration_fee) as total_revenue
       FROM clubs
       WHERE zone IS NOT NULL
       GROUP BY zone
       ORDER BY zone ASC`
    );

    const zonesWithStatus = zones.map(zone => ({
      ...zone,
      is_complete: zone.total_clubs === zone.approved_clubs
    }));

    res.json({
      success: true,
      data: zonesWithStatus
    });
  } catch (error) {
    next(error);
  }
};

// Get advanced analytics for comprehensive dashboard
const getAdvancedAnalytics = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Hourly scan pattern (today)
    const hourlyScan = await dbAll(
      `SELECT
        CAST(strftime('%H', scanned_at) AS INTEGER) as hour,
        COUNT(*) as count
       FROM attendance_logs
       WHERE DATE(scanned_at) = ? AND scan_type = 'check-in'
       GROUP BY hour
       ORDER BY hour ASC`,
      [today]
    );

    // Fill in missing hours with 0
    const hourlyScans = Array.from({ length: 24 }, (_, i) => {
      const existing = hourlyScan.find(h => h.hour === i);
      return {
        hour: i,
        time: `${i.toString().padStart(2, '0')}:00`,
        scans: existing ? existing.count : 0
      };
    });

    // 2. Top 5 clubs by attendance
    const topClubs = await dbAll(
      `SELECT
        c.club_name,
        c.zone,
        COUNT(DISTINCT m.id) as total_members,
        COUNT(DISTINCT a.member_id) as checked_in,
        ROUND(CAST(COUNT(DISTINCT a.member_id) AS FLOAT) / NULLIF(COUNT(DISTINCT m.id), 0) * 100, 2) as attendance_rate
       FROM clubs c
       LEFT JOIN members m ON c.id = m.club_id
       LEFT JOIN attendance_logs a ON m.id = a.member_id AND DATE(a.scanned_at) = ? AND a.scan_type = 'check-in'
       WHERE c.payment_status = 'approved'
       GROUP BY c.id
       HAVING total_members > 0
       ORDER BY checked_in DESC, attendance_rate DESC
       LIMIT 5`,
      [today]
    );

    // 3. Top 5 zones by attendance
    const topZones = await dbAll(
      `SELECT
        c.zone,
        COUNT(DISTINCT m.id) as total_members,
        COUNT(DISTINCT a.member_id) as checked_in,
        ROUND(CAST(COUNT(DISTINCT a.member_id) AS FLOAT) / NULLIF(COUNT(DISTINCT m.id), 0) * 100, 2) as attendance_rate
       FROM clubs c
       LEFT JOIN members m ON c.id = m.club_id
       LEFT JOIN attendance_logs a ON m.id = a.member_id AND DATE(a.scanned_at) = ? AND a.scan_type = 'check-in'
       WHERE c.payment_status = 'approved' AND c.zone IS NOT NULL
       GROUP BY c.zone
       HAVING total_members > 0
       ORDER BY checked_in DESC, attendance_rate DESC
       LIMIT 5`,
      [today]
    );

    // 4. Registration trend (last 30 days)
    const registrationTrend = await dbAll(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as count
       FROM members
       WHERE created_at >= date('now', '-30 days')
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // 5. Attendance trend (last 7 days)
    const attendanceTrend = await dbAll(
      `SELECT
        DATE(scanned_at) as date,
        COUNT(DISTINCT member_id) as count
       FROM attendance_logs
       WHERE scanned_at >= date('now', '-7 days') AND scan_type = 'check-in'
       GROUP BY DATE(scanned_at)
       ORDER BY date ASC`
    );

    // 6. Peak hours analysis
    const peakHours = await dbAll(
      `SELECT
        CAST(strftime('%H', scanned_at) AS INTEGER) as hour,
        COUNT(*) as count
       FROM attendance_logs
       WHERE scan_type = 'check-in'
       GROUP BY hour
       ORDER BY count DESC
       LIMIT 3`
    );

    // 7. Club participation breakdown
    const clubParticipation = await dbAll(
      `SELECT
        CASE
          WHEN COALESCE(attendance_rate, 0) >= 75 THEN 'High (75%+)'
          WHEN COALESCE(attendance_rate, 0) >= 50 THEN 'Medium (50-74%)'
          WHEN COALESCE(attendance_rate, 0) >= 25 THEN 'Low (25-49%)'
          ELSE 'Very Low (<25%)'
        END as category,
        COUNT(*) as count
       FROM (
         SELECT
           c.id,
           ROUND(CAST(COUNT(DISTINCT a.member_id) AS FLOAT) / NULLIF(COUNT(DISTINCT m.id), 0) * 100, 2) as attendance_rate
         FROM clubs c
         LEFT JOIN members m ON c.id = m.club_id
         LEFT JOIN attendance_logs a ON m.id = a.member_id AND DATE(a.scanned_at) = ? AND a.scan_type = 'check-in'
         WHERE c.payment_status = 'approved'
         GROUP BY c.id
       )
       GROUP BY category
       ORDER BY category DESC`,
      [today]
    );

    // 8. Overall statistics
    const totalMembers = await dbGet('SELECT COUNT(*) as count FROM members');
    const totalClubs = await dbGet("SELECT COUNT(*) as count FROM clubs WHERE payment_status = 'approved'");
    const checkedInToday = await dbGet(
      `SELECT COUNT(DISTINCT member_id) as count FROM attendance_logs
       WHERE scan_type = 'check-in' AND DATE(scanned_at) = ?`,
      [today]
    );

    const totalScansToday = await dbGet(
      `SELECT COUNT(*) as count FROM attendance_logs
       WHERE scan_type = 'check-in' AND DATE(scanned_at) = ?`,
      [today]
    );

    res.json({
      success: true,
      data: {
        overview: {
          total_members: totalMembers.count,
          total_clubs: totalClubs.count,
          checked_in_today: checkedInToday.count,
          total_scans_today: totalScansToday.count,
          attendance_rate: totalMembers.count > 0
            ? ((checkedInToday.count / totalMembers.count) * 100).toFixed(2)
            : 0
        },
        hourly_scans: hourlyScans,
        top_clubs: topClubs,
        top_zones: topZones,
        registration_trend: registrationTrend,
        attendance_trend: attendanceTrend,
        peak_hours: peakHours.map(p => ({
          hour: p.hour,
          time: `${p.hour.toString().padStart(2, '0')}:00`,
          count: p.count
        })),
        club_participation: clubParticipation
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAllClubs,
  getClubDetails,
  approveClub,
  rejectClub,
  getAllMembers,
  deleteMember,
  getAnalytics,
  getZones,
  getAdvancedAnalytics
};
