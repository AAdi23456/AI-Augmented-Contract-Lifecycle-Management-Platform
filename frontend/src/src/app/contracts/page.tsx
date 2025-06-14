'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ContractFilters from '@/components/contracts/ContractFilters';
import { format } from 'date-fns';

interface Contract {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  uploadedFileUrl: string;
}

interface FilterState {
  searchTerm: string;
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sortBy: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }

        const data = await response.json();
        setContracts(data);
        setFilteredContracts(data);
      } catch (err) {
        console.error('Error fetching contracts:', err);
        setError('Failed to load contracts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user, router, getToken]);

  const handleFilterChange = (filters: FilterState) => {
    let result = [...contracts];
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(contract => 
        contract.title.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(contract => 
        contract.status.toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      result = result.filter(contract => 
        new Date(contract.createdAt) >= dateFrom
      );
    }
    
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999); // End of day
      result = result.filter(contract => 
        new Date(contract.createdAt) <= dateTo
      );
    }
    
    // Sort results
    result = sortContracts(result, filters.sortBy);
    
    setFilteredContracts(result);
  };
  
  const sortContracts = (contracts: Contract[], sortBy: string) => {
    switch (sortBy) {
      case 'newest':
        return [...contracts].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return [...contracts].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'a-z':
        return [...contracts].sort((a, b) => 
          a.title.localeCompare(b.title)
        );
      case 'z-a':
        return [...contracts].sort((a, b) => 
          b.title.localeCompare(a.title)
        );
      default:
        return contracts;
    }
  };

  // Get appropriate badge color based on contract status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'signed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date in a readable way
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <Link href="/contracts/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload New Contract
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <ContractFilters onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p>Loading contracts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No contracts found</h3>
          <p className="text-gray-500 mb-4">
            {contracts.length > 0 
              ? "No contracts match your search criteria." 
              : "You haven't uploaded any contracts yet."}
          </p>
          {contracts.length === 0 && (
            <Link href="/contracts/upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Contract
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => (
            <Link href={`/contracts/${contract.id}`} key={contract.id}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate">{contract.title}</CardTitle>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Created {formatDate(contract.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 