Social Media Platform

A full-stack social media application that supports user authentication, post creation, real-time messaging, media uploads, notifications, and AI-powered features. The application is built with a React frontend and an Express backend using MongoDB for data persistence and Socket.IO for real-time communication.

---

Features

Authentication

- User registration and login
- JWT-based authentication
- Protected routes
- Password hashing
- Persistent user sessions

User Profiles

- Create and update profile
- Upload profile picture
- Follow and unfollow users
- View user profiles
- User search

Posts

- Create posts
- Upload images
- Edit and delete posts
- Like and unlike posts
- Comment on posts
- Infinite scrolling feed

Real-Time Messaging

- One-to-one messaging
- Instant message delivery using Socket.IO
- Conversation management

Notifications

- Like notifications
- Follow notifications
- Comment notifications

Media Management

- Cloudinary integration
- Image upload and storage
- Media optimization through Cloudinary

AI Features

- AI endpoints integrated into the backend
- Modular AI controller for future feature expansion

---

Tech Stack

Frontend

- React
- Vite
- Redux Toolkit
- React Router
- Axios
- Socket.IO Client

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO
- Cloudinary
- Multer

---

Project Structure

client/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── App.jsx
│
└── ...

server/
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── sockets/
├── utils/
├── config/
└── server.js

---

Installation

Clone the repository

git clone <repository-url>
cd social_media_project

---

Install dependencies

Frontend

cd client
npm install

Backend

cd server
npm install

---

Environment Variables

Create a ".env" file inside the server directory.

PORT=

MONGO_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

CLIENT_URL=

AI_API_KEY=

Depending on your configuration, additional environment variables may be required.

---

Running the Project

Backend

cd server
npm run dev

Frontend

cd client
npm run dev

---

Application Workflow

User

│

├── Authentication

├── Create Post

├── Like / Comment

├── Follow Users

├── Upload Images

└── Real-time Chat

        │

        ▼

Express API

        │

        ├── MongoDB

        ├── Cloudinary

        └── Socket.IO

---

API Overview

Authentication

- User registration
- User login
- Get authenticated user

Users

- Update profile
- Follow / unfollow user
- Search users
- Get user profile

Posts

- Create post
- Update post
- Delete post
- Like post
- Comment on post
- Get feed

Messages

- Send message
- Fetch conversations
- Fetch messages

Notifications

- Get notifications
- Mark notifications as read

AI

- AI-related endpoints

---

Deployment

The project can be deployed using any platform capable of hosting Node.js applications.

Examples include:

- Render
- Railway
- DigitalOcean
- VPS
- Docker

Cloudinary is used for media storage, while MongoDB can be hosted using MongoDB Atlas.

---

Current Limitations

The current implementation is designed as a modular monolithic application. It does not currently include:

- Redis caching
- Background job processing
- Distributed Socket.IO adapter
- Search engine integration
- Automated testing
- Microservices architecture

These can be added in future iterations if higher scalability is required.

---

Future Improvements

- Redis caching
- Background workers for notifications and media processing
- Rate limiting
- API documentation using Swagger/OpenAPI
- Automated testing
- Feed ranking algorithm
- Search optimization
- Admin dashboard
- Performance monitoring


