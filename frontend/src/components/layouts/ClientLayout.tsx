'use client';

import { Navbar } from '@/components/navigation/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
    </AuthProvider>
  );
} 