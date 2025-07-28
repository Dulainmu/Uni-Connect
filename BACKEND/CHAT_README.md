# Chat System Backend

This document describes the real-time chat system backend implementation using Socket.IO and Express.js.

## Features

- **Real-time messaging** using Socket.IO
- **User authentication** with JWT tokens
- **Conversation management** with MongoDB
- **Message persistence** and history
- **Typing indicators**
- **Read receipts**
- **Online/offline status**
- **Unread message counts**

## Architecture

### Models

#### Message Model (`src/models/Message.js`)
- Stores individual messages
- Links sender and receiver
- Supports different message types (text, file, image)
- Tracks read status and timestamps

#### Conversation Model (`src/models/Conversation.js`)
- Manages conversations between users
- Tracks last message and unread counts
- Supports both individual and group chats
- Maintains participant lists

### API Endpoints

#### Authentication Required
All chat endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### GET `/api/chat/conversations`
Get all conversations for the authenticated user.

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conversation_id",
      "name": "User Name",
      "role": "Student",
      "lastMessage": "Hello there!",
      "timestamp": "10:30 AM",
      "unreadCount": 2,
      "avatar": "avatar_url",
      "isGroupChat": false,
      "participants": [...]
    }
  ]
}
```

#### GET `/api/chat/conversations/:conversationId/messages`
Get messages for a specific conversation.

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message_id",
      "senderId": "user_id",
      "senderName": "User Name",
      "content": "Hello!",
      "timestamp": "2024-01-20T10:30:00Z",
      "isOwnMessage": false,
      "messageType": "text",
      "fileUrl": null,
      "isRead": true
    }
  ]
}
```

#### POST `/api/chat/conversations`
Create or get a conversation between two users.

**Request Body:**
```json
{
  "participantId": "user_id"
}
```

#### GET `/api/chat/users`
Get all users available for chat (excluding current user).

**Query Parameters:**
- `search`: Search users by name or email

## Socket.IO Events

### Client to Server Events

#### `send_message`
Send a new message.

**Data:**
```json
{
  "receiverId": "user_id",
  "content": "Message content",
  "messageType": "text",
  "fileUrl": null
}
```

#### `typing_start`
Indicate that user is typing.

**Data:**
```json
{
  "receiverId": "user_id"
}
```

#### `typing_stop`
Indicate that user stopped typing.

**Data:**
```json
{
  "receiverId": "user_id"
}
```

#### `mark_as_read`
Mark messages in a conversation as read.

**Data:**
```json
{
  "conversationId": "conversation_id"
}
```

#### `set_status`
Set user's online status.

**Data:**
```json
{
  "status": "online" | "away" | "offline"
}
```

### Server to Client Events

#### `message_sent`
Confirmation that message was sent successfully.

#### `new_message`
Receive a new message from another user.

#### `conversation_updated`
Update conversation information (last message, unread count).

#### `user_typing`
Another user is typing.

#### `user_stopped_typing`
Another user stopped typing.

#### `messages_read`
Messages were marked as read by another user.

#### `user_status_changed`
User's online status changed.

#### `message_error`
Error occurred while sending message.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file with:
   ```
   MONGODB_URI=mongodb://localhost:27017/campus-connect
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

## Frontend Integration

### Socket Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Example Usage
```javascript
// Send a message
socket.emit('send_message', {
  receiverId: 'user_id',
  content: 'Hello!',
  messageType: 'text'
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Start typing indicator
socket.emit('typing_start', { receiverId: 'user_id' });

// Stop typing indicator
socket.emit('typing_stop', { receiverId: 'user_id' });
```

## Security Features

- **JWT Authentication**: All socket connections require valid JWT tokens
- **User Verification**: Messages can only be sent to valid users
- **Conversation Access Control**: Users can only access conversations they're part of
- **Input Validation**: All message content is validated and sanitized

## Performance Considerations

- **Database Indexing**: Messages and conversations are indexed for efficient querying
- **Connection Management**: Active connections are tracked and cleaned up
- **Message Pagination**: Messages are loaded in chunks to prevent memory issues
- **Real-time Updates**: Only necessary data is broadcasted to connected users

## Error Handling

- **Socket Authentication Errors**: Invalid tokens are rejected with clear error messages
- **Database Errors**: Failed operations are logged and appropriate error responses sent
- **Network Errors**: Connection issues are handled gracefully with reconnection logic
- **Validation Errors**: Invalid data is rejected with descriptive error messages 