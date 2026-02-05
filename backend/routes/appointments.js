const express = require('express');
const router = express.Router();
const {
  setSchedule,
  getAvailability,
  requestAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getMyAppointments,
  getProviderAppointments,
   rescheduleAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.post('/schedule', protect, setSchedule);
router.get('/availability', getAvailability);

router.post('/', protect, requestAppointment);
router.patch('/:id', protect, rescheduleAppointment);
router.patch('/:id/status', protect, updateAppointmentStatus);
router.patch('/:id/cancel', protect, cancelAppointment);

router.get('/my', protect, getMyAppointments);
router.get('/provider', protect, getProviderAppointments);

module.exports = router;
