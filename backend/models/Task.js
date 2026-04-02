const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  // This is the crucial part that demonstrates MongoDB's flexibiity.
  // Using Schema.Types.Mixed allows any arbitrary JSON object to be stored here without strict schema enforcement.
  dynamicFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  comments: [commentSchema]
}, { timestamps: true });

// We need to tell Mongoose that dynamicFields has changed when we update it, 
// because Mongoose doesn't automatically track changes to Mixed types.
taskSchema.pre('save', function() {
  if (this.isModified('dynamicFields')) {
    this.markModified('dynamicFields');
  }
});

module.exports = mongoose.model('Task', taskSchema);
