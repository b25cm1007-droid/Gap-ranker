# IITJ Break Time Quiz Battle — Backend

A real-time quiz battle platform for IIT Jodhpur students to make the most of their 2-hour breaks.

## Features
- 📅 **Timetable-based break detection** with mobile push notifications
- ⚔️ **Branch vs Branch / Year vs Year quiz battles** (30–45 min sessions)
- ❓ **Auto-generated questions** from Open Trivia DB (no API key needed)
- 🔒 **Anti-cheat system** — 3 tab switches = disqualification
- 🏆 **Live leaderboard** by user, branch, and year

---

## Tech Stack
- **Runtime:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.io
- **Auth:** JWT
- **Questions:** Open Trivia DB (free)
- **Push Notifications:** Web Push API (VAPID)
- **Scheduling:** node-cron

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Generate VAPID keys (for push notifications)
```bash
npx web-push generate-vapid-keys
# Paste the keys into your .env file
```

### 4. Start MongoDB
```bash
mongod --dbpath /data/db
```

### 5. Run server
```bash
npm run dev   # development (nodemon)
npm start     # production
```

---

## API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET  | `/api/auth/me` | Get own profile |
| PUT  | `/api/auth/preferences` | Update topics/difficulty |

**Register body:**
```json
{
  "name": "Rahul Kumar",
  "email": "b22cs001@iitj.ac.in",
  "password": "secret123",
  "branch": "CSE",
  "year": 2
}
```

---

### Timetable
| Method | Route | Description |
|--------|-------|-------------|
| PUT | `/api/timetable` | Save weekly timetable |
| GET | `/api/timetable` | Get timetable + all breaks |
| GET | `/api/timetable/breaks/today` | Breaks for today |

**Timetable body:**
```json
{
  "slots": [
    { "day": "Monday", "startTime": "09:00", "endTime": "10:00", "subject": "Maths" },
    { "day": "Monday", "startTime": "12:00", "endTime": "13:00", "subject": "Physics" }
  ]
}
```
A break is detected between 10:00–12:00 (120 min).

---

### Quiz
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/quiz/topics` | List available topics |
| POST | `/api/quiz/create` | Create a quiz room |
| POST | `/api/quiz/join/:roomId` | Join an existing room |
| GET  | `/api/quiz/session/:roomId` | Get session details |
| GET  | `/api/quiz/active` | List active/waiting rooms |

**Create quiz body:**
```json
{
  "topic": "Computers",
  "difficulty": "medium",
  "durationMinutes": 35,
  "battleType": "branch_vs_branch"
}
```

---

### Leaderboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/leaderboard/users` | Individual rankings (filter by branch, year) |
| GET | `/api/leaderboard/branches` | Branch vs Branch rankings |
| GET | `/api/leaderboard/years` | Year vs Year rankings |
| GET | `/api/leaderboard/me` | My rank + stats |

---

### Push Notifications
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/notifications/vapid-public-key` | Get VAPID public key |
| POST   | `/api/notifications/subscribe` | Save push subscription |
| DELETE | `/api/notifications/subscribe` | Remove push subscription |

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ roomId }` | Join quiz room |
| `start_quiz` | `{ roomId }` | Host starts quiz (≥2 players) |
| `submit_answer` | `{ roomId, questionIndex, selectedAnswer, timeSpent }` | Submit answer |
| `tab_switch` | `{ roomId }` | Report tab visibility change (anti-cheat) |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `participant_joined` | `{ participants }` | Someone joined lobby |
| `quiz_started` | `{ questions, durationMinutes }` | Quiz begins (questions without answers) |
| `answer_result` | `{ correct, correctAnswer, pointsEarned, totalScore }` | Result for submitted answer |
| `score_update` | `{ scores }` | Live scores for all players |
| `tab_switch_warning` | `{ count, remaining, message }` | Warning (1st, 2nd switch) |
| `disqualified` | `{ message }` | User disqualified (3rd switch) |
| `participant_disqualified` | `{ name }` | Broadcast to room |
| `quiz_ended` | `{ winner, leaderboard, disqualified }` | Final results |

---

## Anti-Cheat System

The frontend must emit `tab_switch` whenever:
- `document.addEventListener('visibilitychange', ...)` detects hidden state
- Window blur event fires

```javascript
// Frontend implementation
document.addEventListener('visibilitychange', () => {
  if (document.hidden && quizActive) {
    socket.emit('tab_switch', { roomId });
  }
});

window.addEventListener('blur', () => {
  if (quizActive) {
    socket.emit('tab_switch', { roomId });
  }
});
```

- **1st switch:** Warning shown
- **2nd switch:** Final warning  
- **3rd switch:** Immediate disqualification, session ends for that user

---

## Scoring
- Correct answer: **100 points**
- Speed bonus: up to **+50 points** (decreases by 1 every 2 seconds)
- Wrong answer: **0 points**
- Leaderboard ranks by total cumulative score across all sessions

---

## Project Structure
```
iitj-quiz-backend/
├── server.js              # Entry point
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js            # User + timetable + stats
│   ├── QuizSession.js     # Quiz room + questions + participants
│   └── Leaderboard.js     # Individual + branch leaderboard
├── routes/
│   ├── auth.js            # Register, login, profile
│   ├── timetable.js       # Save/get timetable, detect breaks
│   ├── quiz.js            # Create/join rooms
│   ├── leaderboard.js     # Rankings
│   └── notification.js    # Push subscription
├── middleware/
│   └── auth.js            # JWT verification
├── services/
│   ├── triviaService.js   # Open Trivia DB integration
│   ├── quizSocket.js      # Socket.io real-time engine + anti-cheat
│   ├── breakDetector.js   # Detects breaks in timetable
│   ├── breakScheduler.js  # Cron: sends push notifications at break time
│   └── leaderboardService.js # Updates leaderboard after quiz
└── .env.example
```
