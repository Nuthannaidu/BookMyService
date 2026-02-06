const express = require('express');
const router = express.Router();
const {
  setSchedule,
  getSchedule, // <--- 1. Import this new function
  getAvailability,
  requestAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getMyAppointments,
  getProviderAppointments,
  rescheduleAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// --- Schedule Routes ---
router.get('/schedule/:serviceId', protect, getSchedule);
router.post('/schedule', protect, setSchedule);

// --- Availability & Booking ---
router.get('/availability', getAvailability);
router.post('/', protect, requestAppointment);

// --- Status Updates ---
router.patch('/:id', protect, rescheduleAppointment);
router.patch('/:id/status', protect, updateAppointmentStatus);
router.patch('/:id/cancel', protect, cancelAppointment);

// --- Fetching Lists ---
router.get('/my', protect, getMyAppointments);
router.get('/provider', protect, getProviderAppointments);

module.exports = router;