const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  location: { type: String },
  reorderPoint: { type: Number, default: 10 },
  reorderQuantity: { type: Number, default: 50 },
  supplier: { type: String },
  sku: { type: String },
  history: [{
    type: { type: String, enum: ['in', 'out', 'adjustment'] },
    quantity: Number,
    reason: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
