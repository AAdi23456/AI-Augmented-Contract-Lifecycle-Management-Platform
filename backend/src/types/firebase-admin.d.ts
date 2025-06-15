import { ServiceAccount } from 'firebase-admin';

declare module 'firebase-admin' {
  export interface ServiceAccount {
    type?: string;
    project_id?: string;
    private_key_id?: string;
    private_key?: string;
    client_email?: string;
    client_id?: string;
    auth_uri?: string;
    token_uri?: string;
    auth_provider_x509_cert_url?: string;
    client_x509_cert_url?: string;
  }

  export interface App {
    auth(): auth.Auth;
  }

  export interface Auth {
    verifyIdToken(idToken: string): Promise<auth.DecodedIdToken>;
    getUser(uid: string): Promise<auth.UserRecord>;
    createUser(properties: auth.CreateRequest): Promise<auth.UserRecord>;
    setCustomUserClaims(uid: string, customClaims: object): Promise<void>;
  }

  export namespace auth {
    interface DecodedIdToken {
      uid: string;
      [key: string]: any;
    }

    interface UserRecord {
      uid: string;
      email?: string;
      emailVerified: boolean;
      [key: string]: any;
    }

    interface CreateRequest {
      email?: string;
      password?: string;
      emailVerified?: boolean;
      [key: string]: any;
    }
  }
} 