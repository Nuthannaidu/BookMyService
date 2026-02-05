const express = require('express');
const router = express.Router();
const {
  createService,
  getAllProvidersWithServices,
  getServicesByProvider,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');

router.get('/', getAllProvidersWithServices);
router.post('/', protect, createService);
router.get('/:providerId', getServicesByProvider);

module.exports = router;
