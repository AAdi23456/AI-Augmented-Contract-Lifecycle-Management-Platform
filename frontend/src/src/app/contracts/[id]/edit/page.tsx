'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import ContractMetadataForm from '@/components/contracts/ContractMetadataForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditContractPage() {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  useEffect(() => {
    const fetchContract = async () => {
      if (!user) return;
      
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
  }, [contractId, user, getToken]);

  const handleSuccess = (contractId: string) => {
    router.push(`/contracts/${contractId}`);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Contract</h1>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      ) : (
        <ContractMetadataForm 
          contractId={contractId}
          initialData={{
            title: contract?.title || '',
            description: contract?.description || '',
            status: contract?.status || 'draft',
            counterparty: contract?.counterparty || '',
            expiryDate: contract?.expiryDate ? new Date(contract.expiryDate) : null,
            contractValue: contract?.contractValue
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
} 