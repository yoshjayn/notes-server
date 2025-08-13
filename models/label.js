const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a label name'],
    trim: true,
    maxlength: [30, 'Label name cannot be more than 30 characters']
  },
  color: {
    type: String,
    default: '#808080',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique label names per user
labelSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Label', labelSchema);