const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  { testId: String, questionText: String, options: [String], correctAnswer: String },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema({
  candidateId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  testId:       { type: String },
  questions:    [questionSchema],
  answers:      { type: mongoose.Schema.Types.Mixed },
  score:        { type: Number },
  status:       { type: String, enum: ['assigned', 'submitted'], default: 'assigned' },
  submittedAt:  { type: Date },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
