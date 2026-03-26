const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  items: [{
    description: String,
    qty: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft','sent','paid','overdue','cancelled'],
    default: 'draft'
  },
  dueDate: { type: Date },
  paidAt: { type: Date },
  sentAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

invoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Invoice = mongoose.model('Invoice');
    const today = new Date();
    const prefix = `INV-${today.getFullYear()}-`;
    const count = await Invoice.countDocuments({ invoiceNumber: new RegExp('^' + prefix) });
    this.invoiceNumber = prefix + String(count + 1).padStart(4, '0');
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
