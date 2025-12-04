# Campus Connect

Campus Connect is a comprehensive university management system designed to streamline communication and administration between students, lecturers, and administrators. It features real-time chat, appointment booking, ticket management, and announcement broadcasting.

## 🚀 Features

### 🔐 Authentication & Roles
- **Secure Authentication**: JWT-based auth with password hashing (Bcrypt).
- **Role-Based Access Control (RBAC)**: Distinct portals for Students, Lecturers, and Admins.
- **Profile Management**: Users can update their profiles and change passwords.

### 📅 Appointments System
- **Booking**: Students can book appointments with lecturers.
- **Availability**: Lecturers can set availability slots.
- **Management**: Approve, cancel, and complete appointments.
- **Real-time Updates**: Status changes are reflected instantly.

### 💬 Real-time Chat
- **Direct Messaging**: Real-time communication between users using Socket.IO.
- **History**: Persistent chat history stored in MongoDB.

### 🎫 Ticket System
- **Support Tickets**: Students can raise tickets for issues.
- **Tracking**: Track ticket status and resolution.

### 📢 Announcements
- **Broadcast**: Admins and Lecturers can post announcements.
- **Visibility**: Targeted or general announcements for students.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.IO
- **Authentication**: JSON Web Tokens (JWT)

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: TanStack Query, React Context
- **Routing**: React Router DOM

## 📋 Prerequisites

- Node.js (v14+ recommended)
- MongoDB (Local or Atlas)
- npm or yarn

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Uni-Connect
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd BACKEND
npm install
```

Create a `.env` file in the `BACKEND` directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/campus-connect
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
```
The server will run on `http://localhost:3000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd FRONTEND
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 🧪 Running Tests

### Backend Tests
```bash
cd BACKEND
# Run unit tests
node test-timeUtils.js
# Run integration tests (requires server running)
node test-appointments.js
```

### Frontend Tests
```bash
cd FRONTEND
# Run integration tests
node test-appointments-frontend.js
```

## 📂 Project Structure

```
Uni-Connect/
├── BACKEND/                 # Express.js Backend
│   ├── src/
│   │   ├── config/          # DB configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & Error middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── socket/          # Socket.IO logic
│   │   └── utils/           # Utility functions
│   ├── index.js             # Entry point
│   └── ...
├── FRONTEND/                # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Contexts (Auth, Socket)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── ...
│   └── ...
└── README.md                # Project Documentation
```

## © Copyright & License

**All Rights Reserved.**

This source code is the proprietary property of the repository owners. 
Any unauthorized copying, modification, distribution, or use of this code, in whole or in part, is strictly prohibited without the express written permission of the owners.

This project is **NOT** open source.

