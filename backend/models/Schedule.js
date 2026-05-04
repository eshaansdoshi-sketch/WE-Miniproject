const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shiftDate:  { type: Date, required: true },
  startTime:  { type: String },
  endTime:    { type: String },
  workType:   { type: String, enum: ['Office', 'Remote', 'Field'], default: 'Office' },
  notes:      { type: String },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Schedule', scheduleSchema);
