const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Service = require('../models/Service');

/* ---------------- Time Helpers ---------------- */
const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const toTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

/* ---------------- Set Schedule ---------------- */
exports.setSchedule = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can set schedule' });
    }

    const { serviceId, workingHours, unavailableDates } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: 'Service is required' });
    }

    if (!Array.isArray(workingHours) || workingHours.length === 0) {
      return res.status(400).json({ message: 'Working hours required' });
    }

    const schedule = await Schedule.findOneAndUpdate(
      { provider: req.user._id, service: serviceId },
      { workingHours, unavailableDates },
      { upsert: true, new: true }
    );

    res.json(schedule);
  } catch (error) {
    console.error('SET SCHEDULE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- Get Availability ---------------- */
exports.getAvailability = async (req, res) => {
  try {
    const { providerId, serviceId, date } = req.query;

    const service = await Service.findById(serviceId);
    if (!service) return res.json([]);

    const schedule = await Schedule.findOne({ provider: providerId, service: serviceId });
    if (!schedule) return res.json([]);

    if (schedule.unavailableDates.includes(date)) return res.json([]);

    const day = new Date(date).getDay();
    const rule = schedule.workingHours.find(d => d.dayOfWeek === day);
    if (!rule) return res.json([]);

    const startMin = toMinutes(rule.startTime);
    const endMin = toMinutes(rule.endTime);
    const duration = service.duration;

    /* 🔥 GLOBAL SLOT BLOCKING */
    const appointments = await Appointment.find({
      provider: providerId,
      service: serviceId,
      date,
      status: { $nin: ['rejected', 'cancelled'] }, // ✅ KEY FIX
    });

    const bookedRanges = appointments.map(a => ({
      start: toMinutes(a.startTime),
      end: toMinutes(a.endTime),
    }));

    const slots = [];

    for (let t = startMin; t + duration <= endMin; t += duration) {
      const conflict = bookedRanges.some(
        b => t < b.end && t + duration > b.start
      );

      if (!conflict) {
        slots.push({
          startTime: toTime(t),
          endTime: toTime(t + duration),
        });
      }
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- Request Appointment ---------------- */
exports.requestAppointment = async (req, res) => {
  try {
    const { providerId, serviceId, date, startTime } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const startMin = toMinutes(startTime);
    const endMin = startMin + service.duration;

    /* 🔥 PREVENT DOUBLE BOOKING (GLOBAL) */
    const conflict = await Appointment.findOne({
      provider: providerId,
      service: serviceId,
      date,
      status: { $nin: ['rejected', 'cancelled'] }, // ✅ KEY FIX
      $expr: {
        $and: [
          { $lt: [toMinutes('$startTime'), endMin] },
          { $gt: [toMinutes('$endTime'), startMin] },
        ],
      },
    });

    if (conflict) {
      return res.status(409).json({ message: 'Slot already booked' });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      provider: providerId,
      service: serviceId,
      date,
      startTime,
      endTime: toTime(endMin),
      status: 'pending', // 🔒 blocks slot immediately
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- Update Status ---------------- */
exports.updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) return res.status(404).json({ message: 'Not found' });
  if (appointment.provider.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  appointment.status = status;
  await appointment.save();

  res.json(appointment);
};

/* ---------------- Cancel Appointment ---------------- */
exports.cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Not found' });

  appointment.status = 'cancelled';
  await appointment.save();

  res.json(appointment);
};

/* ---------------- User Appointments ---------------- */
exports.getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate('provider service', 'name')
    .sort({ date: 1, startTime: 1 });

  res.json(appointments);
};

/* ---------------- Provider Appointments ---------------- */
exports.getProviderAppointments = async (req, res) => {
  const appointments = await Appointment.find({ provider: req.user._id })
    .populate('user service', 'name')
    .sort({ date: 1, startTime: 1 });

  res.json(appointments);
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, startTime } = req.body;

    if (!date || !startTime) {
      return res.status(400).json({ message: 'Date and start time required' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only the booking user can reschedule
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const service = await Service.findById(appointment.service);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const startMin = toMinutes(startTime);
    const endMin = startMin + service.duration;

    // ❗ Block only ACCEPTED appointments
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      provider: appointment.provider,
      service: appointment.service,
      date,
      status: 'accepted',
      $expr: {
        $and: [
          { $lt: [toMinutes('$startTime'), endMin] },
          { $gt: [toMinutes('$endTime'), startMin] },
        ],
      },
    });

    if (conflict) {
      return res.status(409).json({ message: 'Slot already booked' });
    }

    appointment.date = date;
    appointment.startTime = startTime;
    appointment.endTime = toTime(endMin);
    appointment.status = 'pending'; // reset approval

    await appointment.save();

    res.json(appointment);
  } catch (error) {
    console.error('RESCHEDULE ERROR:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
};
