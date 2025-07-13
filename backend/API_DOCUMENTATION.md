# PlayBookr API Documentation

## Overview
PlayBookr is a comprehensive sports arena booking and team management platform. This API provides all the necessary endpoints for the MVP features including user management, arena booking, team management, matches, tournaments, chat, and notifications.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/change-password` - Change password

### 👤 Users (`/users`)
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile

### 🏟️ Arenas (`/arenas`)
**Public Routes:**
- `GET /arenas` - Get all arenas with filters
- `GET /arenas/search/nearby` - Search arenas by location
- `GET /arenas/:id` - Get single arena details

**Protected Routes:**
- `GET /arenas/my-arenas` - Get user's arenas (arena owners)
- `POST /arenas` - Create new arena (arena owners)
- `PUT /arenas/:id` - Update arena
- `DELETE /arenas/:id` - Delete arena

**Admin Routes:**
- `POST /arenas/:id/approve` - Approve arena (admin only)

### 👥 Teams (`/teams`)
**Public Routes:**
- `GET /teams` - Get all teams with filters
- `GET /teams/leaderboard` - Get team leaderboard
- `GET /teams/:id` - Get single team details

**Protected Routes:**
- `GET /teams/my-teams` - Get user's teams
- `POST /teams` - Create new team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `POST /teams/:id/members` - Add member to team
- `DELETE /teams/:id/members/:userId` - Remove member from team

### 📅 Bookings (`/bookings`)
**All routes require authentication:**
- `GET /bookings` - Get all bookings with filters
- `GET /bookings/my-bookings` - Get user's bookings
- `GET /bookings/arena/:arenaId` - Get arena bookings (arena owner)
- `GET /bookings/:id` - Get single booking details
- `POST /bookings` - Create new booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking
- `POST /bookings/:id/confirm` - Confirm booking (arena owner)
- `POST /bookings/:id/complete` - Complete booking (arena owner)

### ⚔️ Matches (`/matches`)
**Public Routes:**
- `GET /matches` - Get all matches with filters
- `GET /matches/:id` - Get single match details

**Protected Routes:**
- `GET /matches/my-matches` - Get user's matches
- `POST /matches` - Create match from booking
- `PUT /matches/:id` - Update match
- `POST /matches/:id/accept` - Accept match challenge
- `POST /matches/:id/reject` - Reject match challenge
- `POST /matches/:id/start` - Start match
- `POST /matches/:id/complete` - Complete match with results
- `POST /matches/:id/feedback` - Add match feedback

### ⭐ Reviews (`/reviews`)
**Public Routes:**
- `GET /reviews` - Get all reviews with filters
- `GET /reviews/:id` - Get single review details
- `GET /reviews/arena/:arenaId` - Get arena reviews

**Protected Routes:**
- `GET /reviews/my-reviews` - Get user's reviews
- `POST /reviews` - Create new review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review
- `POST /reviews/:id/helpful` - Mark review as helpful
- `POST /reviews/:id/report` - Report review

### 🏆 Tournaments (`/tournaments`)
**Public Routes:**
- `GET /tournaments` - Get all tournaments with filters
- `GET /tournaments/:id` - Get single tournament details

**Protected Routes:**
- `GET /tournaments/my-tournaments` - Get user's tournaments (organizers)
- `GET /tournaments/participating` - Get participating tournaments
- `POST /tournaments` - Create new tournament (arena owners)
- `PUT /tournaments/:id` - Update tournament
- `DELETE /tournaments/:id` - Delete tournament
- `POST /tournaments/:id/register` - Register team for tournament
- `POST /tournaments/:id/accept` - Accept team registration
- `POST /tournaments/:id/reject` - Reject team registration
- `POST /tournaments/:id/start` - Start tournament

### 💬 Chat (`/chats`)
**All routes require authentication:**
- `GET /chats` - Get user's chats
- `GET /chats/direct/:userId` - Get or create direct chat
- `GET /chats/:id` - Get single chat with messages
- `POST /chats` - Create new chat
- `POST /chats/:id/messages` - Send message
- `PUT /chats/:id/messages/:messageId` - Edit message
- `DELETE /chats/:id/messages/:messageId` - Delete message
- `POST /chats/:id/join` - Join group chat
- `POST /chats/:id/leave` - Leave group chat
- `POST /chats/:id/add-member` - Add member to group chat
- `POST /chats/:id/remove-member` - Remove member from group chat

### 🔔 Notifications (`/notifications`)
**All routes require authentication:**
- `GET /notifications` - Get user's notifications
- `GET /notifications/unread-count` - Get unread notification count
- `GET /notifications/settings` - Get notification settings
- `GET /notifications/:id` - Get single notification
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/:id/unread` - Mark notification as unread
- `PUT /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications/delete-all` - Delete all notifications
- `POST /notifications/settings` - Update notification settings

**Admin Routes:**
- `POST /notifications/test` - Send test notification (admin only)

### 🛡️ Admin (`/admin`)
**All routes require admin authentication:**
- `GET /admin/dashboard` - Get admin dashboard stats
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/arenas` - Get all arenas
- `POST /admin/arenas/:id/approve` - Approve arena
- `POST /admin/arenas/:id/reject` - Reject arena
- `GET /admin/reviews` - Get all reviews
- `DELETE /admin/reviews/:id` - Delete review
- `GET /admin/leaderboard` - Get leaderboard stats
- `GET /admin/reports` - Get system reports

## Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: "player" | "arena_owner" | "admin",
  profileImage: String,
  city: String,
  bio: String,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Arena
```javascript
{
  _id: ObjectId,
  name: String,
  owner: ObjectId (ref: User),
  description: String,
  location: {
    city: String,
    address: String,
    coordinates: {
      type: "Point",
      coordinates: [Number, Number]
    }
  },
  sports: ["cricket" | "futsal"],
  pricePerHour: Number,
  images: [String],
  availability: [{
    day: String,
    slots: [String]
  }],
  approved: Boolean,
  rating: Number,
  totalReviews: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Team
```javascript
{
  _id: ObjectId,
  name: String,
  captain: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  sport: "cricket" | "futsal",
  city: String,
  logo: String,
  total_matches: Number,
  wins: Number,
  losses: Number,
  draws: Number,
  totalGoals: Number,
  totalRuns: Number,
  totalWickets: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```javascript
{
  _id: ObjectId,
  arena: ObjectId (ref: Arena),
  user: ObjectId (ref: User),
  team: ObjectId (ref: Team),
  date: Date,
  startTime: String,
  endTime: String,
  duration: Number,
  totalAmount: Number,
  status: "pending" | "confirmed" | "cancelled" | "completed",
  paymentStatus: "pending" | "partial" | "completed" | "refunded",
  advancePayment: Number,
  advancePaymentDetails: {
    amount: Number,
    transactionId: String,
    paymentMethod: String,
    paidAt: Date
  },
  ownerConfirmation: Boolean,
  cancellationReason: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Match
```javascript
{
  _id: ObjectId,
  homeTeam: ObjectId (ref: Team),
  awayTeam: ObjectId (ref: Team),
  arena: ObjectId (ref: Arena),
  booking: ObjectId (ref: Booking),
  sport: "cricket" | "futsal",
  date: Date,
  startTime: String,
  endTime: String,
  status: "scheduled" | "in_progress" | "completed" | "cancelled",
  homeTeamScore: Number,
  awayTeamScore: Number,
  winner: ObjectId (ref: Team),
  matchStats: {
    homeTeamGoals: Number,
    awayTeamGoals: Number,
    homeTeamRuns: Number,
    awayTeamRuns: Number,
    homeTeamWickets: Number,
    awayTeamWickets: Number
  },
  playerStats: [{
    player: ObjectId (ref: User),
    team: ObjectId (ref: Team),
    goals: Number,
    runs: Number,
    wickets: Number,
    isMVP: Boolean
  }],
  challengedBy: ObjectId (ref: Team),
  challengeAccepted: Boolean,
  challengeMessage: String,
  feedback: [{
    player: ObjectId (ref: User),
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Review
```javascript
{
  _id: ObjectId,
  arena: ObjectId (ref: Arena),
  user: ObjectId (ref: User),
  booking: ObjectId (ref: Booking),
  rating: Number (1-5),
  comment: String,
  photos: [String],
  sport: "cricket" | "futsal",
  isVerified: Boolean,
  helpful: [ObjectId] (ref: User),
  reported: Boolean,
  reportReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Tournament
```javascript
{
  _id: ObjectId,
  name: String,
  organizer: ObjectId (ref: User),
  arena: ObjectId (ref: Arena),
  sport: "cricket" | "futsal",
  description: String,
  startDate: Date,
  endDate: Date,
  registrationDeadline: Date,
  maxTeams: Number,
  entryFee: Number,
  prizePool: {
    first: Number,
    second: Number,
    third: Number
  },
  status: "draft" | "open" | "registration_closed" | "in_progress" | "completed" | "cancelled",
  invitedTeams: [ObjectId] (ref: Team),
  registeredTeams: [ObjectId] (ref: Team),
  format: "knockout" | "league" | "group_knockout",
  matches: [ObjectId] (ref: Match),
  rules: [String],
  requirements: [String],
  winner: ObjectId (ref: Team),
  runnerUp: ObjectId (ref: Team),
  thirdPlace: ObjectId (ref: Team),
  isPublic: Boolean,
  images: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Chat
```javascript
{
  _id: ObjectId,
  type: "direct" | "arena" | "city" | "sport" | "tournament",
  name: String,
  description: String,
  participants: [ObjectId] (ref: User),
  members: [ObjectId] (ref: User),
  admins: [ObjectId] (ref: User),
  arena: ObjectId (ref: Arena),
  city: String,
  sport: "cricket" | "futsal",
  tournament: ObjectId (ref: Tournament),
  isActive: Boolean,
  isPrivate: Boolean,
  messages: [{
    sender: ObjectId (ref: User),
    content: String,
    messageType: "text" | "image" | "file" | "system",
    attachments: [{
      type: String,
      name: String,
      size: Number
    }],
    readBy: [ObjectId] (ref: User),
    isEdited: Boolean,
    editedAt: Date,
    createdAt: Date
  }],
  lastMessage: {
    content: String,
    sender: ObjectId (ref: User),
    timestamp: Date
  },
  totalMessages: Number,
  unreadCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification
```javascript
{
  _id: ObjectId,
  recipient: ObjectId (ref: User),
  type: String,
  title: String,
  message: String,
  sender: ObjectId (ref: User),
  arena: ObjectId (ref: Arena),
  booking: ObjectId (ref: Booking),
  match: ObjectId (ref: Match),
  tournament: ObjectId (ref: Tournament),
  team: ObjectId (ref: Team),
  chat: ObjectId (ref: Chat),
  review: ObjectId (ref: Review),
  data: Mixed,
  isRead: Boolean,
  readAt: Date,
  actions: [{
    label: String,
    action: String,
    url: String
  }],
  priority: "low" | "medium" | "high" | "urgent",
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Responses

All error responses follow this format:
```javascript
{
  message: "Error description",
  error?: "Additional error details (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Pagination

List endpoints support pagination with these query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Response includes pagination info:
```javascript
{
  data: [...],
  pagination: {
    current: 1,
    total: 5,
    hasNext: true,
    hasPrev: false
  }
}
```

## Filtering and Sorting

Most list endpoints support filtering and sorting:

**Filtering:**
- `sport` - Filter by sport (cricket/futsal)
- `city` - Filter by city
- `status` - Filter by status
- `rating` - Filter by rating
- `date` - Filter by date

**Sorting:**
- `sortBy` - Field to sort by
- `sortOrder` - "asc" or "desc"

## Environment Variables

Required environment variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/playbookr
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
```

## Running the Server

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
npm start
# or
node server.js
```

The server will start on `http://localhost:5000`

## Testing

Use the test routes for development:
- `GET /api/test` - Test endpoint
- `POST /api/test/seed` - Seed test data (development only) 