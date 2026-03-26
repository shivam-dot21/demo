const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Or null if system/customer via email
    senderName: { type: String },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Ticket = mongoose.model('Ticket');
    const today = new Date();
    const prefix = `TK-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}-`;
    const count = await Ticket.countDocuments({ ticketNumber: new RegExp('^' + prefix) });
    this.ticketNumber = prefix + String(count + 1).padStart(4, '0');
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
