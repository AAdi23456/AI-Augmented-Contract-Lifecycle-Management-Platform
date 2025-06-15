'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ContractForm } from '@/components/contracts/ContractForm';

// Fallback API URL if environment variable is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function NewContractPage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (formData: any) => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    
    try {
      // Try to create via API
      try {
        const response = await fetch(`${API_URL}/contracts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to create contract');
        }
        
        const data = await response.json();
        
        // Redirect to contract details page
        router.push(`/contracts/${data.id}`);
      } catch (err) {
        console.error('API error:', err);
        setError('Backend API not available. Contract not saved.');
        
        // Simulate success for demo purposes
        setTimeout(() => {
          router.push('/contracts');
        }, 1000);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error creating contract. Please try again.');
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
        <h1 className="text-2xl font-bold mb-6">Create New Contract</h1>
        
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <ContractForm 
          onSubmit={handleSubmit}
          isLoading={saving}
        />
      </div>
    </div>
  );
}

export default function ProtectedNewContractPage() {
  return (
    <ProtectedRoute>
      <NewContractPage />
    </ProtectedRoute>
  );
} 