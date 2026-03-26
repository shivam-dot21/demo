const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['call','email','meeting','follow_up','demo','other'],
    default: 'follow_up'
  },
  status: { 
    type: String, 
    enum: ['pending','in_progress','completed','cancelled'],
    default: 'pending'
  },
  priority: { 
    type: String, 
    enum: ['low','medium','high','urgent'],
    default: 'medium'
  },
  dueDate: { type: Date },
  dueTime: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedTo: {
    model: { type: String, enum: ['Customer', 'Lead', 'Deal'] },
    id: { type: mongoose.Schema.Types.ObjectId }
  },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
