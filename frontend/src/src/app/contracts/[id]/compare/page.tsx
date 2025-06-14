'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import VersionCompare from '@/components/contracts/VersionCompare';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CompareVersionsPage() {
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

  const generateDiff = async (version1Id: string, version2Id: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/diff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          version1Id,
          version2Id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate diff');
      }

      const data = await response.json();
      return data.diff;
    } catch (error) {
      console.error('Error generating diff:', error);
      throw error;
    }
  };

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
        onClick={() => router.back()}
      >
        Back to Contract
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Compare Versions</h1>
        <Button 
          onClick={() => router.push(`/contracts/${contractId}/upload-version`)}
        >
          Upload New Version
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : contract?.versions?.length < 2 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            At least two versions are required to compare. Please upload a new version first.
          </AlertDescription>
        </Alert>
      ) : (
        <VersionCompare 
          versions={contract.versions} 
          onGenerateDiff={generateDiff}
        />
      )}
    </div>
  );
} 