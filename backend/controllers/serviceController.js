const Service = require('../models/Service');
const User = require('../models/User');

const ALLOWED_CATEGORIES = ['medical', 'saloon', 'car_rental'];

/*CREATE SERVICE */
exports.createService = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res
        .status(403)
        .json({ message: 'Only providers can create services' });
    }

    let { name, category, duration, price, details } = req.body;

    if (!name || !category || !duration || !price) {
      return res.status(400).json({
        message: 'Name, category, duration and price are required',
      });
    }

    category = category.toLowerCase();

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: 'Invalid service category',
      });
    }

    if (category === 'medical') {
      if (
        !details?.medical?.specialization ||
        !details?.medical?.consultationType
      ) {
        return res.status(400).json({
          message: 'Medical services require specialization and consultation type',
        });
      }
    }

    if (category === 'saloon') {
      if (!details?.saloon?.gender || !details?.saloon?.serviceType) {
        return res.status(400).json({
          message: 'Saloon services require gender and service type',
        });
      }
    }

    if (category === 'car_rental') {
      if (
        !details?.carRental?.vehicleType ||
        !details?.carRental?.transmission ||
        !details?.carRental?.seats
      ) {
        return res.status(400).json({
          message: 'Car rental services require vehicle details',
        });
      }
    }

    const service = await Service.create({
      provider: req.user._id,
      name: name.trim(),
      category,
      duration,
      price,
      details,
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('CREATE SERVICE ERROR:', error);
    res.status(500).json({ message: 'Failed to create service' });
  }
};

/* UPDATE SERVICE */
exports.updateService = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        message: 'Only providers can update services',
      });
    }

    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You are not allowed to update this service',
      });
    }

    let { name, category, duration, price, details } = req.body;

    if (category) {
      category = category.toLowerCase();
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({
          message: 'Invalid service category',
        });
      }
    }

    service.name = name?.trim() || service.name;
    service.category = category || service.category;
    service.duration = duration || service.duration;
    service.price = price || service.price;
    service.details = details || service.details;

    await service.save();
    res.json(service);
  } catch (error) {
    console.error('UPDATE SERVICE ERROR:', error);
    res.status(500).json({ message: 'Failed to update service' });
  }
};

/* DELETE SERVICE*/
exports.deleteService = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can delete services' });
    }

    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // Check appointments using this service
    const hasAppointments = await Appointment.exists({
      service: service._id,
      status: { $in: ['pending', 'accepted'] }
    });

    if (hasAppointments) {
      return res.status(400).json({
        message: 'Cannot delete service with active appointments',
      });
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service' });
  }
};

/*READ OPERATIONS*/
exports.getAllProvidersWithServices = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('name');
    const result = [];

    for (const provider of providers) {
      const services = await Service.find({ provider: provider._id });
      if (services.length > 0) {
        result.push({
          _id: provider._id,
          name: provider.name,
          services,
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error('GET PROVIDERS ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch providers' });
  }
};

exports.getServicesByProvider = async (req, res) => {
  try {
    const services = await Service.find({
      provider: req.params.providerId,
    });
    res.json(services);
  } catch (error) {
    console.error('GET SERVICES ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};
