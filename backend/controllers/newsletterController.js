const Newsletter = require('../models/Newsletter');

exports.subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        existing.unsubscribedAt = null;
        existing.subscribedAt = new Date();
        await existing.save();
        return res.status(200).json({ success: true, data: existing, message: 'Resubscribed successfully' });
      }
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }
    const subscriber = await Newsletter.create({
      email, name,
      source: req.body.source || 'website',
      ipAddress: req.ip
    });
    res.status(201).json({ success: true, data: subscriber, message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const subscriber = await Newsletter.findOne({ email: req.params.email.toLowerCase() });
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
    res.status(200).json({ success: true, data: {}, message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    const total = await Newsletter.countDocuments(query);
    const subscribers = await Newsletter.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: subscribers,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ status: 'active' });
    const csvHeader = 'Email,Name,Source,Subscribed At\n';
    const csvRows = subscribers.map(s =>
      `"${s.email}","${s.name || ''}","${s.source || ''}","${s.subscribedAt}"`
    ).join('\n');
    const csv = csvHeader + csvRows;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    subscriber.status = subscriber.status === 'active' ? 'inactive' : 'active';
    if (subscriber.status === 'inactive') {
      subscriber.unsubscribedAt = new Date();
    } else {
      subscriber.unsubscribedAt = null;
    }
    await subscriber.save();
    res.status(200).json({ success: true, data: subscriber, message: `Subscriber ${subscriber.status === 'active' ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubscriberStats = async (req, res) => {
  try {
    const total = await Newsletter.countDocuments();
    const active = await Newsletter.countDocuments({ status: 'active' });
    const unsubscribed = await Newsletter.countDocuments({ status: 'unsubscribed' });
    res.status(200).json({ success: true, data: { total, active, unsubscribed } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    await Newsletter.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: {}, message: 'Subscribers deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
