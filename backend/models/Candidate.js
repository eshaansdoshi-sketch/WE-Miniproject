const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleId:            { type: mongoose.Schema.Types.ObjectId, ref: 'JobRole' },
  resumeFilePath:    { type: String },
  skills:            [String],
  experienceLevel:   { type: String, enum: ['fresher', 'junior', 'mid', 'senior'], default: 'fresher' },
  experienceSummary: { type: String },
  resumeScore:       { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['applied', 'qualified', 'rejected', 'interview', 'hired'],
    default: 'applied',
  },
  adminNotes:  { type: String },
  appliedAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Candidate', candidateSchema);
