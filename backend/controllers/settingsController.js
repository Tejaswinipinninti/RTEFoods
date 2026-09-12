const Settings = require('../models/Settings');

const getSettingsDocument = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGeneralSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.general = { ...settings.general, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'General settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSEOSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.seo = { ...settings.seo, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'SEO settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSocialSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.social = { ...settings.social, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Social media settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEmailSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.email = { ...settings.email, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Email settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePaymentSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.payment = { ...settings.payment, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Payment settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateShippingSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.shipping = { ...settings.shipping, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Shipping settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaxSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.tax = { ...settings.tax, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Tax settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNotificationSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.notification = { ...settings.notification, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Notification settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFooterSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.footer = { ...settings.footer, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Footer settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMaintenanceSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    settings.maintenance = { ...settings.maintenance, ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: 'Maintenance settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSettings = exports.getAllSettings;
exports.updateSettings = exports.updateGeneralSettings;
exports.updateSection = async (req, res) => {
  try {
    const { section } = req.params;
    const settings = await getSettingsDocument();
    const allowedSections = ['general', 'seo', 'social', 'email', 'payment', 'shipping', 'tax', 'notification', 'footer', 'maintenance'];
    if (!allowedSections.includes(section)) {
      return res.status(400).json({ success: false, message: `Invalid section: ${section}` });
    }
    settings[section] = { ...settings[section], ...req.body };
    await settings.save();
    res.status(200).json({ success: true, data: settings, message: `${section} settings updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
