const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const folder = req.body.folder || 'rte-foods';
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder,
      resource_type: 'auto',
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    });
    fs.unlinkSync(req.file.path);
    res.status(200).json({
      success: true, data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      }, message: 'Image uploaded successfully'
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const folder = req.body.folder || 'rte-foods';
    const uploadPromises = req.files.map(file =>
      cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
      })
    );
    const results = await Promise.all(uploadPromises);
    for (const file of req.files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    }));
    res.status(200).json({ success: true, data: images, message: `${images.length} images uploaded successfully` });
  } catch (error) {
    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadFromBuffer = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file data' });
    }
    const folder = req.body.folder || 'rte-foods';
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder,
        resource_type: 'auto'
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      stream.end(req.file.buffer);
    });
    res.status(200).json({
      success: true, data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      }, message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'Public ID is required' });
    }
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      res.status(200).json({ success: true, data: {}, message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to delete image' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMultipleImages = async (req, res) => {
  try {
    const { publicIds } = req.body;
    if (!publicIds || !publicIds.length) {
      return res.status(400).json({ success: false, message: 'No public IDs provided' });
    }
    const deletePromises = publicIds.map(id => cloudinary.uploader.destroy(id));
    const results = await Promise.all(deletePromises);
    const deleted = results.filter(r => r.result === 'ok').length;
    res.status(200).json({ success: true, data: { deleted, failed: publicIds.length - deleted }, message: `${deleted} images deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadFile = exports.uploadFromBuffer;
exports.uploadMultiple = exports.uploadMultipleImages;
exports.deleteFile = exports.deleteImage;
