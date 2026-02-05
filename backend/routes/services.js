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


router.put('/:serviceId', protect, updateService);
router.delete('/:serviceId', protect, deleteService);

router.get('/:providerId', getServicesByProvider);

module.exports = router;
