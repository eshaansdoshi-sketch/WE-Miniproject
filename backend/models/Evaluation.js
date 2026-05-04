const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  candidateId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  roleId:        { type: mongoose.Schema.Types.ObjectId, ref: 'JobRole' },
  qualified:     { type: Boolean, default: false },
  matchScore:    { type: Number, default: 0 },
  matchedSkills: [String],
  missingSkills: [String],
  feedback:      { type: String },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
