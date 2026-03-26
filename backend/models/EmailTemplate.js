const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body: { type: String, required: true }, // HTML stored here
  variables: [{ type: String }], // e.g. ['{{customerName}}', '{{invoiceNumber}}']
  category: { 
    type: String, 
    enum: ['marketing', 'invoice', 'support', 'general'],
    default: 'general'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
