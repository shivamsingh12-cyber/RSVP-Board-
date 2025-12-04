
# 🎉 An Event RSVP Board  
A simple collaborative event board where hosts can create events, share a join link, and guests can join RSVP without creating an account.  
Guests see live updates to the RSVP list and a real-time chat powered by Socket.io.

This app is perfect for showcasing real-time features, shareable links, multi-role interaction, and a clean Express + React architecture.

---

## 🚀 Features

### 👤 Host Features
- Register & login (JWT-based)
- Create events
- Generate automatic event join links (e.g., `/join/ABC123`)
- View live RSVP responses
- View real-time chat messages
- Close or reopen events
- Delete events

### 🙋 Guest Features (No Login Required)
- Join using event code or link
- Enter a name and RSVP (Yes / No / Maybe)
- See real-time guest list updates
- Participate in event chat
- Name remembered locally per event

### ⚡ Real-Time Features (Socket.io)
- Live RSVP updates when any guest responds
- Live chat messaging
- Guests auto-join event-specific rooms
- Host dashboard updates instantly

---

## 🧱 Tech Stack

### Frontend
- React + TypeScript

### Backend
- Node.js + Express
- MongoDB + Mongoose


### DevOps
- Docker Compose (development mode)


---

## 📂 Project Structure

```css

root/
│
├── rsvp-board-backend/
│   ├── src/
│   ├── Dockerfile
│   ├── .env
│   └── package.json
│
├── rsvp-board-frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.rsvp.yml

```

---

## ⚙️ Installation (Local Development)

### 1. Install backend dependencies
```

cd rsvp-board-backend
npm install

```

### 2. Install frontend dependencies
```

cd ../rsvp-board-frontend
npm install

```

### 3. Start backend
```

npm run dev

```
Backend URL: **http://localhost:5003**

### 4. Start frontend
```

npm run dev

```
Frontend URL: **http://localhost:5175**

---

# 🐳 Running with Docker (Development Mode)

### Start the stack
From project root:

```

docker compose up --build

```

### Access the services
| Service | URL |
|--------|-----|
| Frontend | http://localhost:5175 |
| Backend | http://localhost:5003 |
| MongoDB | mongodb://localhost:27020 |

### Stop the stack
```

docker compose down

```

---

## 🔐 Environment Variables

Create `rsvp-board-backend/.env`:

```

MONGO_URL=mongodb://mongo-rsvp:27017/rsvpBoard
JWT_SECRET=supersecretjwt
CLIENT_URL=[http://localhost:5175](http://localhost:5175)
PORT=your_port

```

---

## 🧪 API Overview

### Auth (Host only)
| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |

### Events (Host endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events` | Create event |
| GET | `/api/events` | Get all host events |
| GET | `/api/events/:id` | Get full event with RSVPs & messages |
| POST | `/api/events/:id/toggle` | Open/close event |
| DELETE | `/api/events/:id` | Delete event |

### Public (Guest endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/events/:code` | Get event details |
| POST | `/api/public/events/:code/rsvp` | Submit/Update RSVP |
| POST | `/api/public/events/:code/messages` | Send chat message |

---

## ⚡ Real-Time Socket.io Events

### Rooms
Each event uses a unique room:
```

event:<code>

```

### Server → Client events
| Event | Description |
|--------|-------------|
| `rsvp_update` | Broadcast updated RSVP list |
| `chat_message` | Broadcast new chat message |

### Client → Server events
| Event | Payload | Description |
|--------|----------|------------|
| `join_event` | `{code}` | Join event room |

---

## 🧠 Event Logic

### RSVP
- Guests identified only by name (no login)
- Duplicate names per event are prevented
- Changing RSVP triggers real-time update

### Chat
- Latest 50 messages stored in database
- Messages broadcast instantly to all clients

### Event Management
Hosts can:
- Open or close events
- Copy join link
- Delete event entirely (removes RSVPs + messages)

---

## 📝 License
MIT — free for educational, personal, and interview use.


```
