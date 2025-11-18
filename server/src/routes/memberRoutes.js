const express = require('express');
const router = express.Router();
const {
  registerMember,
  getMemberBadge,
  getMemberDetails
} = require('../controllers/memberController');

// Public routes
router.post('/register', registerMember);
router.get('/:id/badge', getMemberBadge);
router.get('/:id', getMemberDetails);

module.exports = router;
