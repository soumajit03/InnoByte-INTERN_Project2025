# TaskSphere API 🚀

A robust Node.js REST API for task management with user authentication, file attachments, activity logging, and real-time notifications.

## 📋 Features

- **User Management**: Registration, login, and role-based access control
- **Task Management**: Create, read, update, delete tasks with assignment capabilities
- **File Attachments**: Upload and manage task attachments (JPG, PNG, PDF)
- **Comments System**: Add and delete comments on tasks
- **Activity Logging**: Track all task-related activities
- **Notifications**: Real-time notifications for task updates
- **Security**: Rate limiting, helmet security headers, input validation
- **Filtering & Pagination**: Advanced task filtering and pagination support

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, express-rate-limit, bcryptjs
- **Validation**: express-validator
- **Logging**: Morgan

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tasksphere-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be running at `http://localhost:4000`

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `4000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/tasksphere` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secret_key_here` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## 📚 API Endpoints

### 🏥 Health Check
```
GET /api/health
```

### 👤 User Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/users/register` | Register new user | ❌ |
| `POST` | `/api/users/login` | User login | ❌ |
| `GET` | `/api/users/me` | Get current user profile | ✅ |
| `GET` | `/api/users/` | Get all users (admin only) | ✅ |

### 📋 Task Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/tasks` | Create new task | ✅ |
| `GET` | `/api/tasks` | Get all tasks (with filters) | ✅ |
| `GET` | `/api/tasks/me/assigned` | Get tasks assigned to me | ✅ |
| `GET` | `/api/tasks/:id` | Get task by ID | ✅ |
| `PUT` | `/api/tasks/:id` | Update task | ✅ |
| `DELETE` | `/api/tasks/:id` | Delete task | ✅ |
| `POST` | `/api/tasks/:id/upload` | Upload file attachment | ✅ |
| `POST` | `/api/tasks/:id/comment` | Add comment to task | ✅ |
| `DELETE` | `/api/tasks/:taskId/comment/:commentId` | Delete comment | ✅ |

### 🔔 Notification Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/notifications` | Get my notifications | ✅ |
| `PUT` | `/api/notifications/:id/read` | Mark notification as read | ✅ |
| `DELETE` | `/api/notifications/clear` | Clear all notifications | ✅ |

### 📊 Activity Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/activity/task/:taskId` | Get activity logs for a task | ✅ |
| `GET` | `/api/activity/me` | Get my activity logs | ✅ |

## 🔐 Authentication Usage

### Registration
```javascript
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Login
```javascript
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Using JWT Token
Include the JWT token in the Authorization header for protected routes:
```javascript
Authorization: Bearer your_jwt_token_here
```

### Example with curl:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:4000/api/tasks
```

## 📝 Request/Response Examples

### Create Task
```javascript
POST /api/tasks
Authorization: Bearer your_token
Content-Type: application/json

{
  "title": "Complete API documentation",
  "description": "Write comprehensive API docs",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignedTo": "user_id_here"
}
```

### Response:
```javascript
{
  "success": true,
  "task": {
    "_id": "task_id",
    "title": "Complete API documentation",
    "description": "Write comprehensive API docs",
    "status": "pending",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "assignedTo": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdBy": {
      "_id": "creator_id",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "attachments": [],
    "comments": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔍 Query Parameters

### Get Tasks with Filters
```
GET /api/tasks?status=pending&title=api&page=1&limit=10&dueDate=2024-12-31
```

### Available Filters:
- `status`: Filter by task status (`pending`, `in-progress`, `completed`)
- `title`: Search by title (case-insensitive)
- `dueDate`: Filter by due date
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 10)

## 📁 File Upload

### Supported File Types:
- Images: `.jpg`, `.jpeg`, `.png`
- Documents: `.pdf`

### File Size Limit:
- Maximum: 2MB per file

### Upload Example:
```javascript
POST /api/tasks/:id/upload
Authorization: Bearer your_token
Content-Type: multipart/form-data

{
  "file": [binary file data]
}
```

## ⚠️ Common Errors

### Authentication Errors
```javascript
// No token provided
{
  "success": false,
  "message": "Not authorized, no token"
}

// Invalid token
{
  "success": false,
  "message": "Not authorized, token failed"
}

// Token expired
{
  "success": false,
  "message": "Token expired"
}
```

### Validation Errors
```javascript
// Missing required fields
{
  "success": false,
  "message": "Title is required, Email is required"
}

// Invalid email format
{
  "success": false,
  "message": "Please provide a valid email"
}

// Weak password
{
  "success": false,
  "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
}
```

### Permission Errors
```javascript
// Not authorized for task
{
  "success": false,
  "message": "Not authorized for this task"
}

// Admin only endpoint
{
  "success": false,
  "message": "Admin only"
}
```

### Resource Errors
```javascript
// Task not found
{
  "success": false,
  "message": "Task not found"
}

// Invalid ID format
{
  "success": false,
  "message": "Invalid ID format"
}
```

### Rate Limiting Errors
```javascript
// Too many requests
{
  "success": false,
  "message": "Too many requests, please try again later."
}

// Too many auth attempts
{
  "success": false,
  "message": "Too many authentication attempts, please try again in 15 minutes."
}
```

### File Upload Errors
```javascript
// File too large
{
  "success": false,
  "message": "File too large"
}

// Invalid file type
{
  "success": false,
  "message": "Only .jpg, .png, .pdf files allowed!"
}

// No file provided
{
  "success": false,
  "message": "No file uploaded"
}
```

## 🔒 Security Features

- **Rate Limiting**: API requests are limited to prevent abuse
- **Authentication Rate Limiting**: Login attempts are strictly limited
- **Helmet Security Headers**: Comprehensive security headers
- **Input Validation**: All inputs are validated and sanitized
- **Password Hashing**: Passwords are hashed using bcryptjs
- **JWT Tokens**: Secure authentication with 7-day expiration
- **CORS Protection**: Configurable CORS policy
- **File Upload Security**: File type and size restrictions

## 🏗️ Project Structure

```
tasksphere-api/
├── src/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
├── uploads/                 # File uploads directory
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
└── package.json            # Dependencies and scripts
```

## 🚀 Deployment

### Environment Setup
Make sure to set `NODE_ENV=production` and update CORS origins in production.

### MongoDB
Use MongoDB Atlas or ensure your MongoDB instance is accessible from your deployment environment.

### File Storage
In production, consider using cloud storage (AWS S3, Cloudinary) instead of local file storage.

## 📞 Support

For issues and questions, please check the common errors section above or create an issue in the repository.

---

Built with ❤️ using Node.js and Express.js
