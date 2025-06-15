'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ContractForm } from '@/components/contracts/ContractForm';

// Fallback API URL if environment variable is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function ContractEditPage() {
  const { id } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchContract = async () => {
      if (!user) return;

      try {
        // Try to fetch from API
        try {
          const response = await fetch(`${API_URL}/contracts/${id}`, {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch contract');
          }

          const data = await response.json();
          setContract(data);
        } catch (err) {
          console.error('API error:', err);
          
          // Use mock data if API is not available
          setContract({
            id: id as string,
            title: 'Service Agreement with Acme Corp',
            counterparty: 'Acme Corp',
            effectiveDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
            status: 'Draft',
            tags: ['Service', 'IT']
          });
          setError('Backend API not available. Using sample data.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error fetching contract. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id, user]);

  const handleSubmit = async (formData: any) => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      // Try to update via API
      try {
        const response = await fetch(`${API_URL}/contracts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update contract');
        }
        
        // Redirect to contract details page
        router.push(`/contracts/${id}`);
      } catch (err) {
        console.error('API error:', err);
        setError('Backend API not available. Changes not saved.');
        
        // Simulate success for demo purposes
        setTimeout(() => {
          router.push(`/contracts/${id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error updating contract. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Contract</h1>
        
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : contract ? (
          <ContractForm 
            initialData={contract}
            onSubmit={handleSubmit}
            isLoading={saving}
          />
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Contract not found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/contracts')}
            >
              Back to Contracts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProtectedContractEditPage() {
  return (
    <ProtectedRoute>
      <ContractEditPage />
    </ProtectedRoute>
  );
} 