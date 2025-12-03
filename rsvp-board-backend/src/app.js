require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const publicEventRoutes = require('./routes/publicEventRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('join_event', (code) => {
    socket.join(`event:${code}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/public/events', publicEventRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Mongo connected');
    const PORT = process.env.PORT || 5003;
    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error(err));
