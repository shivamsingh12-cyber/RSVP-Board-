const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createEvent,
  getMyEvents,
  getEventById,
  toggleActive,
  deleteEvent
} = require('../controllers/eventController');

router.use(auth);

router.post('/', createEvent);
router.get('/', getMyEvents);
router.get('/:id', getEventById);
router.post('/:id/toggle', toggleActive);
router.delete('/:id', deleteEvent);

module.exports = router;
