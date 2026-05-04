const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String },
  priority:      { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  assignedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline:      { type: Date },
  status:        { type: String, enum: ['pending', 'in_progress', 'done'], default: 'pending' },
  attachmentUrl: { type: String },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', taskSchema);
