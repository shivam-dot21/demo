const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, default: 0 },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  stage: { 
    type: String, 
    enum: ['prospecting','qualification','proposal','negotiation','closed_won','closed_lost'],
    default: 'prospecting'
  },
  probability: { type: Number, min: 0, max: 100, default: 10 },
  expectedCloseDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty: { type: Number, default: 1 },
    price: { type: Number, default: 0 }
  }],
  notes: { type: String },
  lostReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
