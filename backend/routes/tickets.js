const express = require('express');
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');

const router = express.Router();

// Get all
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, customer } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (customer) query.customer = customer;

    const tickets = await Ticket.find(query)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('assignedTo', 'name')
      .populate('messages.sender', 'name avatar');
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message, isInternal } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });

    ticket.messages.push({
      sender: req.user.id,
      senderName: req.user.name || 'Agent', // Will use populated sender instead
      message,
      isInternal: isInternal || false
    });

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      ticket.status = 'open'; // Reopen ticket if a new message comes in
    }

    await ticket.save();
    
    // Return with populated messages
    const updatedTicket = await Ticket.findById(req.params.id)
      .populate('messages.sender', 'name avatar');

    res.json(updatedTicket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
