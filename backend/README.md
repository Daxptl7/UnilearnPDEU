# Unilearn Backend

Node.js + Express + MongoDB backend for Unilearn course platform.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local install or MongoDB Atlas account)

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a secure random string

3. **Start MongoDB** (if using local MongoDB):
```bash
# On Mac with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

4. **Start the development server**:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Courses
- Coming soon...

### Learning
- Coming soon...

## Database Models

- **User**: Authentication and user profiles
- **Course**: Course information with parts and lectures
- **Enrollment**: Student course enrollments with progress tracking
- **Note**: Student notes for lectures
- **Question**: Q&A/doubts with threaded answers
- **Review**: Course reviews and ratings
- **Announcement**: Instructor announcements

## Tech Stack

- Express.js - Web framework
- MongoDB + Mongoose - Database
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing
