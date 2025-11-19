const express = require('express');
const router = express.Router();
const {
  scanQRCode,
  getAttendanceStats,
  getMemberAttendance,
  exportAttendance
} = require('../controllers/scannerController');
const { authenticateToken } = require('../middleware/auth');

// Protected routes - require authentication
router.post('/scan', authenticateToken, scanQRCode);
router.get('/stats', authenticateToken, getAttendanceStats);
router.get('/member/:id', authenticateToken, getMemberAttendance);
router.get('/export', authenticateToken, exportAttendance);

module.exports = router;
