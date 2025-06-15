'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  Calendar, 
  Tag, 
  User, 
  Clock, 
  ChevronLeft, 
  Download, 
  Eye, 
  PenLine, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  History
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Fallback API URL if environment variable is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Contract {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt?: string;
  status: 'Draft' | 'Review' | 'Signed' | 'Expired';
  counterparty?: string;
  effectiveDate?: string;
  expiryDate?: string;
  createdBy?: string;
  tags?: string[];
  riskScore?: number;
  summary?: string;
}

interface ContractVersion {
  id: string;
  contractId: string;
  fileUrl: string;
  createdAt: string;
  createdBy?: string;
  notes?: string;
}

function ContractDetailPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [versions, setVersions] = useState<ContractVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const contractId = params.id as string;

  useEffect(() => {
    const fetchContractData = async () => {
      if (!user) return;

      try {
        // In a real app, we would fetch from API
        // const response = await fetch(`${API_URL}/contracts/${contractId}`, {
        //   headers: {
        //     Authorization: `Bearer ${await user.getIdToken()}`,
        //   },
        // });
        
        // if (!response.ok) {
        //   throw new Error('Failed to fetch contract details');
        // }
        
        // const data = await response.json();
        // setContract(data);
        
        // For now, use mock data
        setContract({
          id: contractId,
          title: 'Service Agreement with Acme Corp',
          fileUrl: 'https://example.com/contract.pdf',
          fileType: 'application/pdf',
          fileSize: 2.4 * 1024 * 1024,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'Review',
          counterparty: 'Acme Corporation',
          effectiveDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 31536000000).toISOString(), // 1 year from now
          createdBy: 'John Doe',
          tags: ['Service', 'IT', 'Annual'],
          riskScore: 65
        });
        
        // Mock versions data
        setVersions([
          {
            id: '1',
            contractId,
            fileUrl: 'https://example.com/contract-v1.pdf',
            createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
            createdBy: 'John Doe',
            notes: 'Initial draft'
          },
          {
            id: '2',
            contractId,
            fileUrl: 'https://example.com/contract-v2.pdf',
            createdAt: new Date().toISOString(),
            createdBy: 'John Doe',
            notes: 'Updated with legal review comments'
          }
        ]);
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError('Failed to load contract details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [contractId, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getRiskBadgeColor = (score: number) => {
    if (score < 40) return 'bg-green-100 text-green-800';
    if (score < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Review':
        return 'bg-blue-100 text-blue-800';
      case 'Signed':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-red-500 text-center py-10">
          {error || 'Contract not found'}
        </div>
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/contracts')}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Back to Contracts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/contracts')}
            className="flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{contract.title}</h1>
          <Badge className={getStatusBadgeColor(contract.status)}>
            {contract.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download size={16} />
            Download
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Eye size={16} />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <PenLine size={16} />
            Edit
          </Button>
          <Button variant="destructive" size="sm" className="flex items-center gap-1">
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[400px] mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="clauses">Clauses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">File Type</p>
                      <p className="text-sm">{contract.fileType.split('/')[1]?.toUpperCase() || contract.fileType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Effective Date</p>
                      <p className="text-sm">{contract.effectiveDate ? formatDate(contract.effectiveDate) : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                      <p className="text-sm">{contract.expiryDate ? formatDate(contract.expiryDate) : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Counterparty</p>
                      <p className="text-sm">{contract.counterparty || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-sm">{formatDate(contract.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm">{contract.updatedAt ? formatDate(contract.updatedAt) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Summary</CardTitle>
                <CardDescription>AI-generated summary of key points</CardDescription>
              </CardHeader>
              <CardContent>
                {contract.summary ? (
                  <div className="space-y-2 text-sm">
                    {contract.summary.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>No summary available</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        // This would be implemented to generate a summary on demand
                        alert('Summary generation would be triggered here');
                      }}
                    >
                      Generate Summary
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contract.riskScore !== undefined ? (
                  <div className="text-center">
                    <div className="relative h-32 w-32 mx-auto">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{contract.riskScore}</span>
                      </div>
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={contract.riskScore < 40 ? "#4ade80" : contract.riskScore < 70 ? "#facc15" : "#f87171"}
                          strokeWidth="3"
                          strokeDasharray={`${contract.riskScore}, 100`}
                        />
                      </svg>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                      {contract.riskScore < 40 ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Low Risk
                        </Badge>
                      ) : contract.riskScore < 70 ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Medium Risk
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          High Risk
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    No risk assessment available
                  </div>
                )}
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Risk Factors:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-1">
                      <AlertTriangle size={12} className="text-yellow-500" />
                      Indemnification clause
                    </li>
                    <li className="flex items-center gap-1">
                      <AlertTriangle size={12} className="text-yellow-500" />
                      Auto-renewal terms
                    </li>
                    <li className="flex items-center gap-1">
                      <AlertTriangle size={12} className="text-red-500" />
                      Missing limitation of liability
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {contract.tags && contract.tags.length > 0 ? (
                      contract.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Tag size={12} />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No tags</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">File Size</p>
                  <p className="text-sm">{formatFileSize(contract.fileSize)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Created By</p>
                  <p className="text-sm">{contract.createdBy || 'Unknown'}</p>
                </div>
                
                <Button variant="outline" className="w-full flex items-center justify-center gap-1">
                  <PenLine size={16} />
                  Edit Metadata
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Preview</CardTitle>
              <CardDescription>Preview the contract document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md h-96 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Document preview not available</p>
                  <Button variant="outline" className="mt-4">View Full Document</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Version History</CardTitle>
              <Button size="sm">Upload New Version</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {versions.map((version, index) => (
                  <div key={version.id} className="flex items-start gap-4 pb-6 border-b last:border-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <History size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">Version {versions.length - index}</p>
                          <p className="text-sm text-gray-500">{formatDate(version.createdAt)} by {version.createdBy}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      </div>
                      {version.notes && (
                        <div className="mt-2 text-sm bg-gray-50 p-3 rounded-md">
                          {version.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clauses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Clauses</CardTitle>
              <CardDescription>Important clauses extracted from the contract</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Termination</h3>
                  <p className="text-sm text-gray-600">
                    This Agreement may be terminated by either Party upon thirty (30) days written notice to the other Party.
                    Upon termination, Client shall pay Service Provider for all services performed up to the date of termination.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                    <Button variant="ghost" size="sm" className="text-xs">Explain</Button>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Confidentiality</h3>
                  <p className="text-sm text-gray-600">
                    Each Party agrees to maintain the confidentiality of all proprietary information received from the other Party.
                    This obligation shall survive the termination of this Agreement for a period of two (2) years.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">Low Risk</Badge>
                    <Button variant="ghost" size="sm" className="text-xs">Explain</Button>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Indemnification</h3>
                  <p className="text-sm text-gray-600">
                    Client shall indemnify and hold harmless Service Provider from any claims, damages, liabilities, costs and expenses
                    arising from Client's use of the services provided under this Agreement.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-100 text-red-800">High Risk</Badge>
                    <Button variant="ghost" size="sm" className="text-xs">Explain</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
              <CardDescription>Recent activity related to this contract</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">John Doe</span> uploaded a new version
                    </p>
                    <p className="text-xs text-gray-500">Today at 10:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <PenLine size={16} />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Jane Smith</span> added a comment to the Termination clause
                    </p>
                    <p className="text-xs text-gray-500">Yesterday at 2:15 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Tag size={16} />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">John Doe</span> added tag "IT" to the contract
                    </p>
                    <p className="text-xs text-gray-500">June 14, 2025</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">John Doe</span> created the contract
                    </p>
                    <p className="text-xs text-gray-500">June 10, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProtectedContractDetailPage() {
  return (
    <ProtectedRoute>
      <ContractDetailPage />
    </ProtectedRoute>
  );
} 