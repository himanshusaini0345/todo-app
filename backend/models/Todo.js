const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

todoSchema.pre('save', function() {
  if (this.isModified('status')) {
    this.completed = this.status === 'completed';
  } else if (this.isModified('completed')) {
    this.status = this.completed ? 'completed' : 'pending';
  }
});

module.exports = mongoose.model('Todo', todoSchema);
