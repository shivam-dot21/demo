const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['note','call','email','meeting','order','task','status_change','lead_converted'],
    required: true
  },
  description: { type: String, required: true },
  relatedTo: {
    model: { type: String, required: true },
    id: { type: mongoose.Schema.Types.ObjectId, required: true }
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
