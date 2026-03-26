const express = require('express');
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');

const router = express.Router();

// Get all customers with metrics
router.get('/', auth, async (req, res) => {
  try {
    const { tags, segment, industry, companySize, region } = req.query;
    let query = {};
    if (tags) query.tags = { $in: tags.split(',') };
    if (segment) query.segment = segment;
    if (industry) query.industry = industry;
    if (companySize) query.companySize = companySize;
    if (region) query.region = region;

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    
    // Get order statistics for each customer
    const Order = require('../models/Order');
    
    const customersWithMetrics = await Promise.all(
      customers.map(async (customer) => {
        const customerOrders = await Order.find({ customer: customer._id });
        
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const orderCount = customerOrders.length;
        const lastOrder = customerOrders.length > 0 
          ? customerOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0]
          : null;
        
        return {
          ...customer.toObject(),
          metrics: {
            totalSpent,
            orderCount,
            lastOrderDate: lastOrder ? lastOrder.orderDate : null
          }
        };
      })
    );
    
    res.json(customersWithMetrics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get customer by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create customer
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;
    const customer = new Customer({
      name,
      email,
      phone,
      address,
      status,
    });
    await customer.save();
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, status, updatedAt: Date.now() },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }
    res.json({ msg: 'Customer deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get customer timeline
router.get('/:id/timeline', auth, async (req, res) => {
  try {
    const Activity = require('../models/Activity');
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({
      'relatedTo.model': 'Customer',
      'relatedTo.id': req.params.id
    })
    .populate('performedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json(activities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Segments and Tags logic
router.get('/segments/all', auth, async (req, res) => {
  try {
    const segments = await Customer.aggregate([
      { $match: { segment: { $exists: true, $ne: null } } },
      { $group: { _id: "$segment", count: { $sum: 1 }, totalRevenue: { $sum: "$annualRevenue" } } }
    ]);
    res.json(segments.map(s => ({ segment: s._id, count: s.count, totalRevenue: s.totalRevenue })));
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/tags/all', auth, async (req, res) => {
  try {
    const tags = await Customer.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } }
    ]);
    res.json(tags.map(t => ({ tag: t._id, count: t.count })));
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/:id/tags', auth, async (req, res) => {
  try {
    const { tags } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, { $addToSet: { tags: { $each: tags } } }, { new: true });
    res.json(customer);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.delete('/:id/tags/:tag', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { $pull: { tags: req.params.tag } }, { new: true });
    res.json(customer);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.put('/:id/segment', auth, async (req, res) => {
  try {
    const { segment } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, { segment }, { new: true });
    res.json(customer);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
