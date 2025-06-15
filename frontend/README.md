# Contract Lifecycle Management Platform

A modern, AI-powered contract management system built with Next.js, Firebase, and NestJS.

## Features

- Upload and manage contracts (PDF, DOCX, DOC)
- Extract and analyze contract text
- Track contract versions and changes
- AI-powered contract analysis and risk detection
- User authentication and role-based access control
- Secure file storage with Firebase

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase account

### Setup Instructions

1. Clone the repository
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Configure Firebase:

The application uses a Firebase service account for authentication and storage operations. The service account credentials are stored in `firebase/serviceAccount.json`.

- Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
- Generate a new private key for your service account:
  - Go to Project Settings > Service accounts
  - Click "Generate new private key"
  - Save the JSON file as `firebase/serviceAccount.json` in the project

4. Set up environment variables:

```bash
# Run the setup script
node setup-env.js
```

This will create a `.env.local` file with the necessary configuration.

5. Start the development server:

```bash
npm run dev
```

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components
- `/src/contexts` - React context providers
- `/src/services` - Service modules for API interactions
- `/src/config` - Configuration files
- `/src/hooks` - Custom React hooks
- `/src/styles` - Global styles and Tailwind configuration
- `/src/types` - TypeScript type definitions
- `/firebase` - Firebase configuration and service account

## Firebase Integration

The application uses Firebase for:

1. **Authentication** - User login and registration
2. **Storage** - Secure contract file storage
3. **Firestore** - Contract metadata and user data

The Firebase Admin SDK is used for server-side operations, such as:
- Generating signed URLs for secure file access
- Verifying ID tokens for API authentication
- Managing user roles and permissions
- Performing secure database operations

## API Routes

The application provides the following API endpoints:

- `POST /api/contracts` - Create a new contract
- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/[id]` - Get a contract by ID
- `PATCH /api/contracts/[id]` - Update a contract
- `DELETE /api/contracts/[id]` - Delete a contract
- `POST /api/contracts/extract` - Extract text from a contract file
- `POST /api/auth/verify` - Verify a Firebase ID token
- `POST /api/auth/token` - Create a custom Firebase token

## License

This project is licensed under the MIT License.
