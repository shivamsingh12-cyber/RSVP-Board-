const { nanoid } = require('nanoid');
const Event = require('../models/Event');
const Rsvp = require('../models/Rsvp');
const Message = require('../models/Message');

exports.createEvent = async (req, res) => {
  const { title, description, dateTime, location } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  let code;
  let exists = true;

  // ensure unique code
  while (exists) {
    code = nanoid(6);
    const found = await Event.findOne({ code });
    exists = !!found;
  }

  const event = await Event.create({
    title,
    description,
    dateTime: dateTime ? new Date(dateTime) : null,
    location,
    code,
    host: req.user.id,
    isActive: true
  });

  const shareUrl = `${process.env.CLIENT_URL}/join/${event.code}`;

  res.json({ event, shareUrl });
};

exports.getMyEvents = async (req, res) => {
  const events = await Event.find({ host: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.json(events);
};

exports.getEventById = async (req, res) => {
  const eventId = req.params.id;
  const event = await Event.findOne({ _id: eventId, host: req.user.id }).lean();
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const rsvps = await Rsvp.find({ event: eventId }).sort({ createdAt: -1 }).lean();
  const messages = await Message.find({ event: eventId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({ event, rsvps, messages });
};

exports.toggleActive = async (req, res) => {
  const eventId = req.params.id;
  const event = await Event.findOne({ _id: eventId, host: req.user.id });
  if (!event) return res.status(404).json({ error: 'Event not found' });

  event.isActive = !event.isActive;
  await event.save();

  res.json(event);
};

exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id;
  const event = await Event.findOneAndDelete({
    _id: eventId,
    host: req.user.id
  });
  if (!event) return res.status(404).json({ error: 'Event not found' });

  await Rsvp.deleteMany({ event: eventId });
  await Message.deleteMany({ event: eventId });

  res.json({ success: true });
};
