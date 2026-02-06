const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Service = require('../models/Service');

const isPastEndTime = (date, endTime) => {
  const appointmentEnd = new Date(`${date}T${endTime}`);
  return appointmentEnd < new Date();
};
exports.getSchedule = async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const schedule = await Schedule.findOne({ 
      provider: req.user._id, 
      service: serviceId 
    });

    if (!schedule) {
      return res.json({ workingHours: [], unavailableDates: [] });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedule' });
  }
};

const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const toTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};


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


exports.getAvailability = async (req, res) => {
  try {
    const { providerId, serviceId, date } = req.query;

    const service = await Service.findById(serviceId);
    if (!service) return res.json([]);

    const schedule = await Schedule.findOne({ provider: providerId, service: serviceId });
    if (!schedule) return res.json([]);

    if (schedule.unavailableDates.includes(date)) return res.json([]);

    const day = new Date(date).getDay();
    const dailyShifts = schedule.workingHours.filter(d => d.dayOfWeek === day);
    
    if (dailyShifts.length === 0) return res.json([]);

    const duration = service.duration;

    const appointments = await Appointment.find({
      provider: providerId,
      service: serviceId,
      date,
      status: { $nin: ['rejected', 'cancelled'] }, 
    });

    const bookedRanges = appointments.map(a => ({
      start: toMinutes(a.startTime),
      end: toMinutes(a.endTime),
    }));

    const slots = [];

   
    for (const shift of dailyShifts) {
      const startMin = toMinutes(shift.startTime);
      const endMin = toMinutes(shift.endTime);

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
    }

    slots.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.requestAppointment = async (req, res) => {
  try {
    const { providerId, serviceId, date, startTime } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const startMin = toMinutes(startTime);
    const endMin = startMin + service.duration;

    const conflict = await Appointment.findOne({
      provider: providerId,
      service: serviceId,
      date,
      status: { $nin: ['rejected', 'cancelled'] }, 
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
      status: 'pending', 
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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

exports.cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Not found' });

  appointment.status = 'cancelled';
  await appointment.save();

  res.json(appointment);
};


exports.getMyAppointments = async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate('provider service', 'name')
    .sort({ date: 1, startTime: 1 });

  res.json(appointments);
};

exports.getProviderAppointments = async (req, res) => {
  try {
    const providerId = req.user._id;

    let appointments = await Appointment.find({ provider: providerId })
      .populate('user')
      .populate('service')
      .sort({ date: 1, startTime: 1 });

  
    const updates = appointments.map(async (appt) => {
      if (
        appt.status === 'accepted' &&
        isPastEndTime(appt.date, appt.endTime)
      ) {
        appt.status = 'completed';
        await appt.save();
      }
    });

    await Promise.all(updates);

   
    appointments = await Appointment.find({ provider: providerId })
      .populate('user')
      .populate('service')
      .sort({ date: 1, startTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
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

 
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const service = await Service.findById(appointment.service);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const startMin = toMinutes(startTime);
    const endMin = startMin + service.duration;

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
    appointment.status = 'pending'; 

    await appointment.save();

    res.json(appointment);
  } catch (error) {
    console.error('RESCHEDULE ERROR:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
};