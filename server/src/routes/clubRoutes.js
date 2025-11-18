const express = require('express');
const router = express.Router();
const {
  registerClub,
  uploadPaymentProof,
  getPaymentInfo,
  getApprovedClubs,
  checkClubStatus
} = require('../controllers/clubController');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', registerClub);
router.post('/:id/upload-payment', upload.single('proof_of_payment'), uploadPaymentProof);
router.get('/payment-info', getPaymentInfo);
router.get('/approved', getApprovedClubs);
router.get('/:id/status', checkClubStatus);

module.exports = router;
