'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import UserProfile from '@/components/auth/UserProfile';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <UserProfile />
        </div>
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user.name || 'User'}!</h2>
            <p className="text-gray-600 mb-4">
              This is your dashboard for the AI-Augmented Contract Lifecycle Management Platform.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium">Your role is: {user.role || 'VIEWER'}</p>
              {user.role === 'ADMIN' && (
                <p className="mt-2">As an admin, you have full access to all platform features.</p>
              )}
              {user.role === 'LEGAL' && (
                <p className="mt-2">As a legal team member, you can review and approve contracts.</p>
              )}
              {(!user.role || user.role === 'VIEWER') && (
                <p className="mt-2">As a viewer, you can view contracts and track their status.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 