const express = require('express');
const router = express.Router();
const {
  getEventByCode,
  submitRsvp,
  postMessage
} = require('../controllers/publicEventController');

router.get('/:code', getEventByCode);
router.post('/:code/rsvp', submitRsvp);
router.post('/:code/messages', postMessage);

module.exports = router;
