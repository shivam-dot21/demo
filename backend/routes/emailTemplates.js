const express = require('express');
const auth = require('../middleware/auth');
const EmailTemplate = require('../models/EmailTemplate');
const nodemailer = require('nodemailer');

const router = express.Router();

// Mock transporter for demo purposes
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: { user: 'demo@ethereal.email', pass: 'demo' }
});

// Get all templates
router.get('/', auth, async (req, res) => {
  try {
    const templates = await EmailTemplate.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create template
router.post('/', auth, async (req, res) => {
  try {
    const { name, subject, body, variables, category } = req.body;
    const template = new EmailTemplate({
      name, subject, body, variables, category,
      createdBy: req.user ? req.user.id : null
    });
    await template.save();
    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update template
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const template = await EmailTemplate.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!template) return res.status(404).json({ msg: 'Template not found' });
    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete template
router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ msg: 'Template not found' });
    res.json({ msg: 'Template deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Send email using a template
router.post('/send', auth, async (req, res) => {
  try {
    const { templateId, to, context } = req.body; // context is an object mapping variables to values
    const template = await EmailTemplate.findById(templateId);
    if (!template) return res.status(404).json({ msg: 'Template not found' });

    let finalHtml = template.body;
    let finalSubject = template.subject;
    
    // Replace variables
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        finalHtml = finalHtml.replace(regex, value);
        finalSubject = finalSubject.replace(regex, value);
      }
    }

    // In a real app, send actual email here.
    // For demo, we just log and return success.
    console.log(`Sending email to ${to} with subject: ${finalSubject}`);
    
    // Log the activity to recent activity (optional integration)
    const Activity = require('../models/Activity');
    const Customer = require('../models/Customer');
    const customer = await Customer.findOne({ email: to });
    
    if (customer) {
      await Activity.create({
        type: 'email',
        description: `Sent email: ${finalSubject}`,
        relatedTo: { model: 'Customer', id: customer._id },
        performedBy: req.user ? req.user.id : null
      });
    }

    res.json({ msg: 'Email sent successfully', subject: finalSubject });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during email send');
  }
});

module.exports = router;
