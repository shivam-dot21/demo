const express = require('express');
const auth = require('../middleware/auth');
const Deal = require('../models/Deal');

const router = express.Router();

// Get pipeline summary
router.get('/pipeline/summary', auth, async (req, res) => {
  try {
    const deals = await Deal.find();
    
    let totalValue = 0;
    const stageValues = {};
    const winCount = deals.filter(d => d.stage === 'closed_won').length;
    const closedCount = deals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage)).length;
    const winRate = closedCount > 0 ? (winCount / closedCount) * 100 : 0;
    const totalWonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (d.value || 0), 0);
    const avgDealSize = winCount > 0 ? totalWonValue / winCount : 0;

    deals.forEach(deal => {
        totalValue += deal.value || 0;
        stageValues[deal.stage] = (stageValues[deal.stage] || 0) + (deal.value || 0);
    });

    res.json({
        totalValue,
        stageValues,
        winRate,
        avgDealSize,
        totalDeals: deals.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all deals
router.get('/', auth, async (req, res) => {
  try {
    const { stage, assignedTo } = req.query;
    let query = {};
    if (stage) query.stage = stage;
    if (assignedTo) query.assignedTo = assignedTo;

    const deals = await Deal.find(query)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name')
      .sort({ expectedCloseDate: 1 });
    res.json(deals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single deal
router.get('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('customer', 'name email address')
      .populate('lead', 'name company')
      .populate('assignedTo', 'name email')
      .populate('products.product', 'name price');
    if (!deal) return res.status(404).json({ msg: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create deal
router.post('/', auth, async (req, res) => {
  try {
    const dealData = req.body;
    const deal = new Deal(dealData);
    await deal.save();
    res.json(deal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update deal
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = req.body;
    updateData.updatedAt = Date.now();
    const deal = await Deal.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!deal) return res.status(404).json({ msg: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete deal
router.delete('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ msg: 'Deal not found' });
    res.json({ msg: 'Deal deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
