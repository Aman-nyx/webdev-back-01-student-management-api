const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    title: {
      type: String,
      default: 'Untitled Course',
    },
    description: String,
    credits: {
      type: Number,
      min: 0,
      max: 12,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    capacity: Number,
    enrolledStudents: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    schedule: {
      day: String,
      startTime: String,
      endTime: String,
      location: String,
    },
    semester: String,
    gradeDistribution: {
      A: { type: Number, default: 0 },
      B: { type: Number, default: 0 },
      C: { type: Number, default: 0 },
      F: { type: Number, default: 0 },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
