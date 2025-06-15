'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

// Define the API URL (not used directly in this component)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Contract {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  status: 'Draft' | 'Review' | 'Signed' | 'Expired';
}

function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        
        // Get the ID token
        const idToken = await user.getIdToken();
        
        const response = await fetch(`/api/contracts`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch contracts');
        }

        const data = await response.json();
        setContracts(data);
      } catch (err) {
        console.error('Error fetching contracts:', err);
        setError('Failed to fetch contracts. Using sample data.');
        
        // Use mock data if API is not available
        setContracts([
          // Add some sample contracts for development
          {
            id: '1',
            title: 'Sample Contract 1.pdf',
            fileUrl: '#',
            fileType: 'application/pdf',
            fileSize: 1024 * 1024,
            createdAt: new Date().toISOString(),
            status: 'Draft'
          },
          {
            id: '2',
            title: 'Sample Contract 2.docx',
            fileUrl: '#',
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileSize: 2 * 1024 * 1024,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'Review'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  const filteredContracts = contracts.filter((contract) =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <Link
          href="/contracts/upload"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <Plus size={18} />
          <span>Upload Contract</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search contracts..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2">
            <Filter size={18} />
            <span>Filter</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-amber-500 text-center py-4 mb-6">{error}</div>
          // Continue showing the contracts even if there's an error with sample data
        ) : null}

        {filteredContracts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No contracts found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'No contracts match your search criteria.'
                : 'Upload your first contract to get started.'}
            </p>
            {!searchTerm && (
              <Link
                href="/contracts/upload"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                <Plus size={18} />
                <span>Upload Contract</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/contracts/${contract.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium text-gray-900">{contract.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contract.status === 'Draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : contract.status === 'Review'
                            ? 'bg-blue-100 text-blue-800'
                            : contract.status === 'Signed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.fileType && contract.fileType.includes('/') 
                        ? contract.fileType.split('/')[1]?.toUpperCase() 
                        : contract.fileType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProtectedContractsPage() {
  return (
    <ProtectedRoute>
      <ContractsPage />
    </ProtectedRoute>
  );
} 