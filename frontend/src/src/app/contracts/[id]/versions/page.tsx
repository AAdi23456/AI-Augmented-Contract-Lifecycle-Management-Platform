'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, GitCompare } from 'lucide-react';
import VersionCompare from '@/components/contracts/VersionCompare';

export default function VersionsPage() {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  useEffect(() => {
    const fetchContract = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch contract details');
        }

        const data = await response.json();
        setContract(data);
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError('Failed to load contract details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId, user, router, getToken]);

  if (error && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.push(`/contracts/${contractId}`)}
      >
        Back to Contract
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Version History</h1>
          {!loading && contract && (
            <p className="text-gray-500 mt-1">
              {contract.title}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push(`/contracts/${contractId}/upload-version`)}
          >
            <Upload className="h-4 w-4 mr-2" />
            New Version
          </Button>
          {!loading && contract?.versions?.length >= 2 && (
            <Button 
              variant="outline"
              onClick={() => router.push(`/contracts/${contractId}/compare`)}
            >
              <GitCompare className="h-4 w-4 mr-2" />
              Compare Versions
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : contract?.versions?.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No versions available for this contract. Please upload a version first.
          </AlertDescription>
        </Alert>
      ) : (
        <VersionCompare versions={contract.versions} />
      )}
    </div>
  );
} 