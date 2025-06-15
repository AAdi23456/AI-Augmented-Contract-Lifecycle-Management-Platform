declare namespace NodeJS {
  interface ProcessEnv {
    // Firebase environment variables
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    
    // Firebase Admin SDK environment variables
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;
    
    // OpenAI environment variables
    OPENAI_API_KEY: string;
    
    // API environment variables
    NEXT_PUBLIC_API_URL: string;
  }
}

// Type declaration for Firebase service account
interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

// Allow importing JSON files
declare module '*.json' {
  const value: any;
  export default value;
}

// Declare Firebase service account import
declare module '@/firebase/serviceAccount.json' {
  const serviceAccount: FirebaseServiceAccount;
  export default serviceAccount;
} 