const mongoose = require('mongoose');

const skillPathSchema = new mongoose.Schema({
  candidateId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  missingSkills: [String],
  roadmap: [{
    skill:           { type: String },
    priority:        { type: String, enum: ['Critical', 'Important', 'Nice-to-have'] },
    topics:          [String],
    resources:       [String],
    estimatedWeeks:  { type: Number },
  }],
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SkillPath', skillPathSchema);
