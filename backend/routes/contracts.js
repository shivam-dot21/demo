const express = require('express');
const Contract = require('../models/Contract');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/contracts
 * @desc    Get all contracts
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('customer', 'name email')
      .populate('deal', 'title')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   POST /api/contracts
 * @desc    Create a contract
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const newContract = new Contract(req.body);
    const contract = await newContract.save();
    res.json(contract);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET /api/contracts/:id
 * @desc    Get contract by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('deal', 'title');
    
    if (!contract) return res.status(404).json({ msg: 'Contract not found' });
    res.json(contract);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   PUT /api/contracts/:id
 * @desc    Update a contract
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.json(contract);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   DELETE /api/contracts/:id
 * @desc    Delete a contract
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Contract removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
