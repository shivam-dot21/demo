const express = require('express');
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

const router = express.Router();

// Get all leads with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, source, assignedTo } = req.query;
    let query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;

    const leads = await Lead.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single lead
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email').populate('convertedToCustomer', 'name');
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create lead
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, company, source, status, score, assignedTo, notes } = req.body;
    const lead = new Lead({
      name, email, phone, company, source, status, score, assignedTo, notes
    });
    await lead.save();
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, company, source, status, score, assignedTo, notes } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, company, source, status, score, assignedTo, notes, updatedAt: Date.now() },
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.json({ msg: 'Lead deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Convert lead to customer
router.post('/:id/convert', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    if (lead.status === 'converted') {
      return res.status(400).json({ msg: 'Lead is already converted' });
    }

    const customer = new Customer({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      address: '',
      status: 'active'
    });
    await customer.save();

    lead.status = 'converted';
    lead.convertedToCustomer = customer._id;
    await lead.save();

    res.json({ lead, customer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
