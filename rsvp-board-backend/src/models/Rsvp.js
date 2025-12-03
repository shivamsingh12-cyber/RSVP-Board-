const mongoose = require('mongoose');
const { Schema } = mongoose;

const rsvpSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['yes', 'no', 'maybe'], default: 'yes' }
  },
  { timestamps: true }
);

// one RSVP per (event, name)
rsvpSchema.index({ event: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Rsvp', rsvpSchema);
