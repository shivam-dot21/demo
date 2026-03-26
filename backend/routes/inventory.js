const express = require('express');
const auth = require('../middleware/auth');
const Inventory = require('../models/Inventory');

const router = express.Router();

// Get low stock items
router.get('/low-stock', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find({
      $expr: { $lte: ["$quantity", "$reorderPoint"] }
    }).populate('product', 'name');
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product', 'name');
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get inventory item by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate('product', 'name');
    if (!item) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create inventory item
router.post('/', auth, async (req, res) => {
  try {
    const { product, quantity, location, reorderPoint, reorderQuantity, supplier, sku } = req.body;
    const item = new Inventory({
      product,
      quantity,
      location,
      reorderPoint,
      reorderQuantity,
      supplier,
      sku,
      history: [{
        type: 'in',
        quantity,
        reason: 'Initial stock',
        performedBy: req.user ? req.user.id : null
      }]
    });
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Restock
router.post('/:id/restock', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    
    item.quantity += quantity;
    item.history.push({
      type: 'in',
      quantity,
      reason: 'Restock',
      performedBy: req.user ? req.user.id : null
    });
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Adjust
router.post('/:id/adjust', auth, async (req, res) => {
  try {
    const { quantityOffset, reason } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    
    item.quantity += quantityOffset;
    item.history.push({
      type: 'adjustment',
      quantity: quantityOffset,
      reason,
      performedBy: req.user ? req.user.id : null
    });
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// History
router.get('/:id/history', auth, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate('history.performedBy', 'name');
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    // sort history desc manually or rely on dates since they are pushed
    res.json(item.history.reverse());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update inventory item
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: Date.now() };
    const item = await Inventory.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }
    res.json({ msg: 'Inventory item deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
