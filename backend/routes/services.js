const express = require('express');
const router = express.Router();
const {
  createService,
  getAllProvidersWithServices,
  getServicesByProvider,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');

router.get('/', getAllProvidersWithServices);
router.post('/', protect, createService);
router.get('/:providerId', getServicesByProvider);

router.put('/:serviceId', protect, updateService);
router.delete('/:serviceId', protect, deleteService);

module.exports = router;
