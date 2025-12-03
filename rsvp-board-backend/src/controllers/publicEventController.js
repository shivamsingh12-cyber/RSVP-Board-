const Event = require('../models/Event');
const Rsvp = require('../models/Rsvp');
const Message = require('../models/Message');

const getRoomName = (code) => `event:${code}`;

exports.getEventByCode = async (req, res) => {
  const { code } = req.params;
  const event = await Event.findOne({ code }).lean();
  if (!event || !event.isActive) {
    return res.status(404).json({ error: 'Event not found or closed' });
  }

  const rsvps = await Rsvp.find({ event: event._id }).sort({ createdAt: -1 }).lean();
  const messages = await Message.find({ event: event._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({
    event: {
      id: event._id,
      title: event.title,
      description: event.description,
      dateTime: event.dateTime,
      location: event.location,
      code: event.code,
      isActive: event.isActive
    },
    rsvps,
    messages
  });
};

exports.submitRsvp = async (req, res) => {
  const { code } = req.params;
  const { name, status } = req.body;

  if (!name || !status) {
    return res.status(400).json({ error: 'Name and status required' });
  }

  const event = await Event.findOne({ code });
  if (!event || !event.isActive) {
    return res.status(404).json({ error: 'Event not found or closed' });
  }

  let rsvp = await Rsvp.findOne({ event: event._id, name });

  if (!rsvp) {
    rsvp = await Rsvp.create({ event: event._id, name, status });
  } else {
    rsvp.status = status;
    await rsvp.save();
  }

  const rsvps = await Rsvp.find({ event: event._id }).sort({ createdAt: -1 }).lean();

  const io = req.app.get('io');
  io.to(getRoomName(code)).emit('rsvp_update', rsvps);

  res.json({ rsvps });
};

exports.postMessage = async (req, res) => {
  const { code } = req.params;
  const { name, text } = req.body;

  if (!name || !text) {
    return res.status(400).json({ error: 'Name and text required' });
  }

  const event = await Event.findOne({ code });
  if (!event || !event.isActive) {
    return res.status(404).json({ error: 'Event not found or closed' });
  }

  const message = await Message.create({
    event: event._id,
    name,
    text
  });

  const payload = {
    id: message._id,
    name: message.name,
    text: message.text,
    createdAt: message.createdAt
  };

  const io = req.app.get('io');
  io.to(getRoomName(code)).emit('chat_message', payload);

  res.json(payload);
};
