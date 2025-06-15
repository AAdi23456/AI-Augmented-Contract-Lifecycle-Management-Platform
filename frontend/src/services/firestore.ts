import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/config/firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// User types
export type UserRole = 'user' | 'support' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket types
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Firestore service class
export class FirestoreService {
  // User operations
  static async createUser(userId: string, email: string): Promise<void> {
    const user: Omit<User, 'id'> = {
      email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(doc(db, 'users', userId), user);
  }

  static async getUser(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  static async updateUserRole(userId: string, role: UserRole): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: new Date(),
    });
  }

  // Ticket operations
  static async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ticketRef = doc(collection(db, 'tickets'));
    const newTicket: Omit<Ticket, 'id'> = {
      ...ticket,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(ticketRef, newTicket);
    return ticketRef.id;
  }

  static async getTicket(ticketId: string): Promise<Ticket | null> {
    const ticketDoc = await getDoc(doc(db, 'tickets', ticketId));
    if (!ticketDoc.exists()) return null;
    return { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;
  }

  static async getUserTickets(userId: string): Promise<Ticket[]> {
    const q = query(collection(db, 'tickets'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Ticket);
  }

  static async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
    await updateDoc(doc(db, 'tickets', ticketId), {
      status,
      updatedAt: new Date(),
    });
  }

  static async assignTicket(ticketId: string, assignedTo: string): Promise<void> {
    await updateDoc(doc(db, 'tickets', ticketId), {
      assignedTo,
      status: 'in-progress',
      updatedAt: new Date(),
    });
  }
} 