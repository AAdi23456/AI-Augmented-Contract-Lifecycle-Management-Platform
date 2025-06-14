'use client';

import React from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function UserProfile() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get initials from name or email
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  // Get appropriate color for role badge
  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'LEGAL':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.photoURL} alt={user.name || user.email} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{user.name || 'User'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Role:</span>
            <Badge variant="outline" className={getRoleBadgeColor()}>
              {user.role || 'VIEWER'}
            </Badge>
          </div>
          {user.orgId && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500">Organization:</span>
              <span className="text-sm">{user.orgId}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={logout} className="w-full">
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
} 