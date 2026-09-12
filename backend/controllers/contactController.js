const Contact = require('../models/Contact');
const sendEmail = require('../services/emailService');

exports.createContact = async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, ipAddress: req.ip });
    res.status(201).json({ success: true, data: contact, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const { search, status, type, priority, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
    res.status(200).json({
      success: true, data: contacts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    if (contact.status === 'pending') {
      contact.status = 'read';
      await contact.save();
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyToContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    contact.reply = {
      text: req.body.text,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };
    contact.status = 'replied';
    await contact.save();
    try {
      await sendEmail({
        to: contact.email,
        subject: `Re: ${contact.subject}`,
        text: req.body.text,
        html: `<p>Dear ${contact.name},</p><p>${req.body.text}</p><p>Best regards,<br>RTE Foods Team</p>`
      });
    } catch (emailError) {
      // Continue even if email fails
    }
    res.status(200).json({ success: true, data: contact, message: 'Reply sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.status(200).json({ success: true, data: contact, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const pending = await Contact.countDocuments({ status: 'pending' });
    const replied = await Contact.countDocuments({ status: 'replied' });
    const resolved = await Contact.countDocuments({ status: 'resolved' });
    res.status(200).json({ success: true, data: { total, pending, replied, resolved } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteContacts = async (req, res) => {
  try {
    const { ids } = req.body;
    await Contact.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, data: {}, message: 'Contacts deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContact = exports.getContactById;
exports.bulkDelete = exports.bulkDeleteContacts;
