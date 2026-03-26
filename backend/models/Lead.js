const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  source: { 
    type: String, 
    enum: ['website','referral','cold_call','social_media','email_campaign','other'],
    default: 'website'
  },
  status: { 
    type: String, 
    enum: ['new','contacted','qualified','unqualified','converted'],
    default: 'new'
  },
  score: { type: Number, min: 0, max: 100, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
