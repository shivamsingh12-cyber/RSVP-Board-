const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
