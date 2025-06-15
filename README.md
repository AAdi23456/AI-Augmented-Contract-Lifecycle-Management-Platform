# HR Helpdesk - Contract Management System

A modern contract management system with AI-powered features for document processing, summarization, and analysis.

## Project Overview

This application allows users to:
- Upload and manage contracts and documents
- Extract text from PDFs and Word documents
- Generate AI-powered summaries of contracts
- Track contract versions and status
- Search and filter contracts by various criteria

## Tech Stack

### Frontend
- Next.js 15.x
- Tailwind CSS
- shadcn/ui components
- Firebase Authentication
- Firebase Storage

### Backend
- NestJS
- PostgreSQL with TypeORM
- Firebase Admin SDK
- OpenAI API for AI features

## Setup Instructions

### Prerequisites
- Node.js 18.x or later
- PostgreSQL 14.x or later
- Firebase project with Authentication and Storage enabled
- OpenAI API key (for AI features)

### PostgreSQL Setup

1. Install PostgreSQL on your system or use a cloud provider
2. Create a new database for the application:

```sql
CREATE DATABASE hr_helpdesk;
```

3. Create a user with appropriate permissions:

```sql
CREATE USER hr_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hr_helpdesk TO hr_user;
```

### Environment Configuration

#### Backend (.env file)

Create a `.env` file in the `backend` directory with the following variables:

```
# Database Configuration
DB_HOST=localhost            # PostgreSQL host
DB_PORT=5432                 # PostgreSQL port
DB_USERNAME=hr_user          # PostgreSQL username
DB_PASSWORD=your_secure_password  # PostgreSQL password
DB_NAME=hr_helpdesk          # PostgreSQL database name
DB_SYNC=true                 # Set to false in production

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n-----END PRIVATE KEY-----\n

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### Frontend (.env.local file)

Create a `.env.local` file in the `frontend` directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_API_URL=http://localhost:3001/api

# Firebase Admin SDK (for server-side)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n-----END PRIVATE KEY-----\n
FIREBASE_PROJECT_ID=your-project-id
```

### Installation

1. Install backend dependencies:
```
cd backend
npm install
```

2. Install frontend dependencies:
```
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```
cd backend
npm run start:dev
```

2. Start the frontend development server:
```
cd frontend
npm run dev
```

3. Access the application at http://localhost:3000

## API Documentation

The API documentation is available at http://localhost:3001/api/docs when the backend server is running.

## Database Schema

The application uses the following main tables:

- `users`: User information and authentication
- `contracts`: Contract metadata and status
- `contract_versions`: Version history for contracts
- `documents`: Document metadata and processing status

## Features

- Firebase Authentication
- Document Upload to Firebase Storage
- Text Extraction from PDFs and Word documents
- AI-powered Document Summarization
- Contract Version Control
- Search and Filter Functionality
- Role-based Access Control