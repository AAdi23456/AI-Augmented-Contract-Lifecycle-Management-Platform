import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ContractDetailTabs } from '../../components/contracts/ContractDetailTabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/use-toast';
import { ArrowLeft, Calendar, Building, Loader2 } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  status: string;
  fileUrl: string;
  createdAt: string;
  expiryDate?: string;
  effectiveDate?: string;
  counterpartyName?: string;
  createdBy?: {
    name: string;
    email: string;
  };
  summaries?: any[];
  clauses?: any[];
  riskTerms?: any[];
  versions?: any[];
}

export default function ContractDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchContract(id as string);
    }
  }, [id]);

  const fetchContract = async (contractId: string) => {
    try {
      setLoading(true);
      const data = await api.get<Contract>(`/contracts/${contractId}`);
      setContract(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch contract details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-500';
      case 'review':
        return 'bg-blue-500';
      case 'signed':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : contract ? (
            <>
              {/* Contract Header */}
              <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-6 py-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold">{contract.title}</h1>
                      <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                        <span>Uploaded by {contract.createdBy?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>

                  {/* Contract Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {contract.counterpartyName && (
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Counterparty</p>
                          <p className="font-medium">{contract.counterpartyName}</p>
                        </div>
                      </div>
                    )}
                    {contract.effectiveDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Effective Date</p>
                          <p className="font-medium">
                            {new Date(contract.effectiveDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {contract.expiryDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Expiry Date</p>
                          <p className="font-medium">
                            {new Date(contract.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contract Detail Tabs */}
              <div className="bg-white shadow rounded-lg p-6">
                <ContractDetailTabs contract={contract} />
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Contract not found</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 