const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Signed', 'Active', 'Expired', 'Cancelled'],
    default: 'Draft',
  },
  value: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  notes: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
