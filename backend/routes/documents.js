const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const router = express.Router();

// --- 1. MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|jpeg|jpg|png|doc|docx|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, images, and Word documents are allowed!'));
  }
});

// --- 2. ROUTES ---

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a new document
 * @access  Private
 */
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }

    const { relatedTo, relatedId, name } = req.body;

    if (!relatedTo || !relatedId) {
      // Cleanup the uploaded file if metadata is missing
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ msg: 'relatedTo and relatedId are required' });
    }

    const newDocument = new Document({
      name: name || req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).substring(1),
      relatedTo,
      relatedId,
      uploadedBy: req.user.id,
      size: req.file.size
    });

    const document = await newDocument.save();
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET /api/documents/:relatedId
 * @desc    Get all documents for a specific entity
 * @access  Private
 */
router.get('/:relatedId', auth, async (req, res) => {
  try {
    const documents = await Document.find({ relatedId: req.params.relatedId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Optional: Only allow uploader or admin to delete
    // if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(401).json({ msg: 'User not authorized' });
    // }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
