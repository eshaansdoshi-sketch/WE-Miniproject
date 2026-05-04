const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema({
  roleName:           { type: String, required: true },
  description:        { type: String },
  requiredSkills:     [String],
  preferredSkills:    [String],
  minExperienceLevel: { type: String, enum: ['fresher', 'junior', 'mid', 'senior'], default: 'junior' },
  minResumeScore:     { type: Number, default: 50 },
  isActive:           { type: Boolean, default: true },
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:          { type: Date, default: Date.now },
});

module.exports = mongoose.model('JobRole', jobRoleSchema);
