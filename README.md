# AI-Augmented Contract Lifecycle Management Platform

An advanced contract management system with AI-powered features for contract analysis, risk detection, and lifecycle management.

## Features

- **Authentication & Role Management**: Firebase authentication with role-based access control (Admin, Legal, Viewer)
- **File Upload & Storage**: Upload and store contract documents securely in Firebase Storage
- **Contract Management**: Create, view, update, and delete contracts with versioning
- **AI-Powered Analysis**: Extract clauses, detect risks, and generate summaries using AI
- **Contract Q&A Assistant**: Ask questions about your contracts and get AI-powered answers
- **Dashboard & Analytics**: View contract statistics and analytics

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Firebase Authentication

### Backend
- NestJS
- PostgreSQL with TypeORM
- Firebase Admin SDK
- OpenAI API integration

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Firebase account with Authentication and Storage enabled

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your database and Firebase credentials.

4. Run database migrations:
   ```
   npm run migration:run
   ```

5. Start the development server:
   ```
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file based on `.env.local.example` and fill in your Firebase credentials.

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

### Backend

- `src/auth`: Authentication module
- `src/firebase`: Firebase integration module
- `src/contracts`: Contract management module
- `src/database`: Database models and migrations
- `src/openai`: OpenAI integration for AI features

### Frontend

- `src/pages`: Next.js pages
- `src/components`: React components
- `src/contexts`: React contexts (Auth, etc.)
- `src/services`: API and Firebase services
- `src/styles`: Global styles

## License

This project is licensed under the MIT License - see the LICENSE file for details.