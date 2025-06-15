# Document Processing Workflow

This document explains the complete workflow for document upload, text extraction, and AI summarization in the HR Helpdesk application.

## Workflow Steps

1. **Document Upload**
   - User selects a document (PDF or DOCX) through the file uploader component
   - The document is uploaded to Firebase Storage using Firebase SDK
   - Upload progress is tracked and displayed to the user
   - Once upload is complete, the file URL is obtained

2. **Text Extraction**
   - The uploaded document URL is sent to the `/api/contracts/extract` endpoint
   - For PDF files, the `pdf-parse` library extracts the text
   - For DOCX files, the `mammoth` library extracts the text
   - The extracted text is cleaned and normalized
   - The text is returned to the client and displayed in the UI

3. **AI Summarization**
   - The extracted text is sent to the `/api/contracts/summarize` endpoint
   - The API uses OpenAI's GPT-3.5 model to generate a concise summary
   - The summary is returned to the client and displayed in the UI
   - The summary is also saved to the contract record in the database

## Implementation Details

### Firebase Storage Integration
- Documents are stored in Firebase Storage under a path that includes the user ID
- Signed URLs are generated for secure access to the files

### Text Extraction API
- Server-side API using Next.js API routes
- Uses appropriate libraries based on file type
- Handles large files by streaming and processing them efficiently

### OpenAI Integration
- Uses the OpenAI API with the GPT-3.5-turbo model
- Prompts the model to generate a concise 5-bullet summary
- Handles token limits by truncating very large documents

## Configuration Requirements

To use this workflow, you need to set up the following environment variables:

1. **Firebase Configuration**
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

2. **Firebase Admin SDK**
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

3. **OpenAI API**
   - `OPENAI_API_KEY`

## Usage

1. Navigate to the contract upload page
2. Select a document to upload
3. Click "Upload Contract"
4. Wait for the upload to complete
5. The extracted text and AI-generated summary will be displayed
6. The document and its summary are now available in the contracts list 