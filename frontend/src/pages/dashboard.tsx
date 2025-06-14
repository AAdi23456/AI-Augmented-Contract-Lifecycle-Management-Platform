import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ContractUpload } from '../components/ContractUpload';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Loader2, Plus, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

interface Contract {
  id: string;
  title: string;
  status: string;
  fileUrl: string;
  createdAt: string;
  expiryDate?: string;
  counterpartyName?: string;
  riskScore?: number;
}

export default function Dashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch contracts when component mounts
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await api.get<Contract[]>('/contracts');
      setContracts(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch contracts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContractUploadSuccess = (contract: Contract) => {
    setContracts((prev) => [contract, ...prev]);
    setShowUpload(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getRiskBadge = (riskScore?: number) => {
    if (riskScore === undefined) return null;

    if (riskScore < 30) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" /> Low Risk
        </Badge>
      );
    } else if (riskScore < 70) {
      return (
        <Badge className="bg-yellow-500">
          <AlertTriangle className="h-3 w-3 mr-1" /> Medium Risk
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500">
          <AlertTriangle className="h-3 w-3 mr-1" /> High Risk
        </Badge>
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Contract Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Welcome, {user?.email}
              </span>
              <Button variant="outline" onClick={() => setShowUpload(!showUpload)}>
                {showUpload ? 'Cancel' : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    New Contract
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {showUpload ? (
            <div className="mb-6">
              <ContractUpload onSuccess={handleContractUploadSuccess} />
            </div>
          ) : null}

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Contracts</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="review">Under Review</TabsTrigger>
              <TabsTrigger value="signed">Signed</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : contracts.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-500">No contracts found</p>
                    <Button
                      className="mt-4"
                      onClick={() => setShowUpload(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Your First Contract
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contracts.map((contract) => (
                    <Card key={contract.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="truncate">{contract.title}</CardTitle>
                            <CardDescription>
                              {new Date(contract.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-2">
                          {contract.counterpartyName && (
                            <p className="text-sm">
                              <span className="font-medium">Counterparty:</span>{' '}
                              {contract.counterpartyName}
                            </p>
                          )}
                          {contract.expiryDate && (
                            <p className="text-sm">
                              <span className="font-medium">Expires:</span>{' '}
                              {new Date(contract.expiryDate).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            {getRiskBadge(contract.riskScore)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(contract.fileUrl, '_blank')}
                            >
                              View Document
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Other tabs would filter by status */}
            {['draft', 'review', 'signed', 'expired'].map((status) => (
              <TabsContent key={status} value={status} className="mt-6">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contracts
                      .filter((c) => c.status.toLowerCase() === status)
                      .map((contract) => (
                        <Card key={contract.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="truncate">{contract.title}</CardTitle>
                                <CardDescription>
                                  {new Date(contract.createdAt).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <Badge className={getStatusColor(contract.status)}>
                                {contract.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col space-y-2">
                              {contract.counterpartyName && (
                                <p className="text-sm">
                                  <span className="font-medium">Counterparty:</span>{' '}
                                  {contract.counterpartyName}
                                </p>
                              )}
                              {contract.expiryDate && (
                                <p className="text-sm">
                                  <span className="font-medium">Expires:</span>{' '}
                                  {new Date(contract.expiryDate).toLocaleDateString()}
                                </p>
                              )}
                              <div className="flex justify-between items-center mt-2">
                                {getRiskBadge(contract.riskScore)}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(contract.fileUrl, '_blank')}
                                >
                                  View Document
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
} 