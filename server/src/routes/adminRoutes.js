const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllClubs,
  getClubDetails,
  approveClub,
  rejectClub,
  getAllMembers,
  deleteMember,
  getAnalytics,
  getZones
} = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

// All admin routes require authentication
router.use(authenticateToken);

// Dashboard & Analytics
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// Club Management
router.get('/clubs', getAllClubs);
router.get('/clubs/:id', getClubDetails);
router.put('/clubs/:id/approve', approveClub);
router.put('/clubs/:id/reject', rejectClub);

// Member Management
router.get('/members', getAllMembers);
router.delete('/members/:id', deleteMember);

// Zone Management
router.get('/zones', getZones);

module.exports = router;
