const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    dateTime: Date,
    location: String,
    code: { type: String, required: true, unique: true }, // shareable
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
