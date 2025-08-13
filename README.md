# Notes App Backend API

A RESTful API for a full-featured notes application with JWT authentication, labels, and advanced filtering.

## Features

- **JWT Authentication**: Secure user registration and login
- **User Management**: Profile updates, password reset
- **Notes CRUD**: Create, read, update, delete notes
- **Labels System**: Organize notes with custom labels
- **Advanced Features**: Pin notes, archive, drag-and-drop reordering
- **Search & Filter**: Full-text search and multi-criteria filtering
- **Role-based Access**: Admin and user roles

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```env
   MONGODB_URI=mongodb+srv://yoshjayn:KkmwEYCVaUhAPqEE@cluster0.rpyipnv.mongodb.net/notesApp
  JWT_SECRET=your_jwt_secret_key
  PORT=5000
   ```

4. Start the server:
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/updatedetails` | Update user details | Private |
| PUT | `/api/auth/updatepassword` | Update password | Private |
| POST | `/api/auth/forgotpassword` | Request password reset | Public |
| PUT | `/api/auth/resetpassword/:token` | Reset password | Public |

### Notes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/notes` | Get all user notes | Private |
| POST | `/api/notes` | Create new note | Private |
| GET | `/api/notes/:id` | Get single note | Private |
| PUT | `/api/notes/:id` | Update note | Private |
| DELETE | `/api/notes/:id` | Delete note | Private |
| PUT | `/api/notes/reorder` | Reorder notes | Private |
| PUT | `/api/notes/:id/pin` | Toggle pin status | Private |
| PUT | `/api/notes/:id/archive` | Toggle archive status | Private |

### Labels

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/labels` | Get all user labels | Private |
| POST | `/api/labels` | Create new label | Private |
| GET | `/api/labels/:id` | Get label with notes | Private |
| PUT | `/api/labels/:id` | Update label | Private |
| DELETE | `/api/labels/:id` | Delete label | Private |
| POST | `/api/labels/:id/notes` | Add label to notes | Private |
| DELETE | `/api/labels/:id/notes` | Remove label from notes | Private |

## Request & Response Examples

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "userId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Create Note
```json
POST /api/notes
Headers: Authorization: Bearer <token>
{
  "title": "My First Note",
  "description": "This is the content of my note",
  "color": "#ffeb3b",
  "labels": ["labelId1", "labelId2"]
}
```

### Get Notes with Filters
```
GET /api/notes?search=important&isPinned=true&labels=labelId1,labelId2&sortBy=-createdAt
Headers: Authorization: Bearer <token>
```

### Create Label
```json
POST /api/labels
Headers: Authorization: Bearer <token>
{
  "name": "Work",
  "color": "#2196f3"
}
```

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Validation errors include field-specific messages:
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

## Folder Structure

```
notes-app-backend/
├── controllers/        # Route controllers
│   ├── auth.js
│   ├── notes.js
│   └── labels.js
├── middleware/        # Custom middleware
│   ├── auth.js       # JWT authentication
│   ├── error.js      # Error handling
│   └── validate.js   # Validation middleware
├── models/           # Mongoose models
│   ├── User.js
│   ├── Note.js
│   └── Label.js
├── routes/           # API routes
│   ├── auth.js
│   ├── notes.js
│   └── labels.js
├── utils/            # Utility functions
│   └── jwt.js
├── validators/       # Validation rules
│   └── validationRules.js
├── .env             # Environment variables
├── .env.example     # Example environment file
├── package.json
└── server.js        # Entry point
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Request validation and sanitization
- CORS protection
- User-owned resource validation
- Role-based access control

## Development Tips

1. Use Postman or similar tools to test endpoints
2. Check MongoDB indexes for optimal performance
3. Monitor error logs in development
4. Use proper status codes for responses
5. Keep JWT secret secure and complex

## Future Enhancements

- Email service for password reset
- File attachments for notes
- Collaborative notes sharing
- Real-time updates with WebSockets
- Rate limiting for API endpoints
- Automated testing suite