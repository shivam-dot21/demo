const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect'],
    default: 'active',
  },
  tags: [{ type: String }],
  segment: { type: String },
  industry: { type: String },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-1000', '1000+']
  },
  annualRevenue: { type: Number },
  region: { type: String },
  source: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
