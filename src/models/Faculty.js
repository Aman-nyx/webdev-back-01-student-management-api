const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Unknown Faculty',
    },
    code: {
      type: String,
      lowercase: true,
    },
    dean: String,
    numDepartments: {
      type: Number,
      default: 0,
    },
    budget: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);
