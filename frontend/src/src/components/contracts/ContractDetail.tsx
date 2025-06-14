'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon, 
  FileText, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Eye,
  Edit,
  Upload,
  GitCompare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import VersionCompare from './VersionCompare';

interface ContractVersion {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  versionNumber: number;
  createdAt: string;
}

interface ContractSummary {
  id: string;
  summaryText: string;
  createdAt: string;
}

interface ContractDetailProps {
  contract: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    uploadedFileUrl: string;
    expiryDate?: string;
    versions: ContractVersion[];
    summary?: ContractSummary;
    contractType?: string;
    effectiveDate?: string;
    value?: number;
    currency?: string;
    description?: string;
    ourParty?: string;
    counterparty?: string;
    owner?: {
      name: string;
    };
  };
  isLoading?: boolean;
}

export default function ContractDetail({ contract, isLoading = false }: ContractDetailProps) {
  const [activeTab, setActiveTab] = useState('details');
  const router = useRouter();

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
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Determine file icon based on file type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-5 w-5" />;
    
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }
    
    return <FileText className="h-5 w-5" />;
  };

  // Handle document download
  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <ContractDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Contract Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{contract.title}</h1>
          <div className="flex items-center mt-2">
            <Badge variant="outline" className={`${getStatusColor(contract.status)} mr-2`}>
              {contract.status}
            </Badge>
            <span className="text-sm text-gray-500">
              Created on {formatDate(contract.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/contracts/${contract.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/contracts/${contract.id}/upload-version`)}
          >
            <Upload className="h-4 w-4 mr-2" />
            New Version
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/contracts/${contract.id}/compare`)}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
              <CardDescription>Key details about this contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(contract.status)}>
                    {contract.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Created By</p>
                  <p>{contract.createdBy.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Created On</p>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <p>{formatDate(contract.createdAt)}</p>
                  </div>
                </div>
                {contract.expiryDate && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Expires On</p>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <p>{formatDate(contract.expiryDate)}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p>{formatDate(contract.updatedAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Versions</p>
                  <p>{contract.versions.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Contract Type</p>
                  <p>{contract.contractType || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Effective Date</p>
                  <p>{formatDate(contract.effectiveDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Value</p>
                  <p>
                    {contract.value 
                      ? new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: contract.currency || 'USD' 
                        }).format(contract.value)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Tab */}
        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>
                View or download the latest version of this contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contract.versions && contract.versions.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <p className="font-medium">{contract.versions[0].fileName}</p>
                        <p className="text-sm text-gray-500">
                          Version {contract.versions[0].versionNumber} • Uploaded {formatDate(contract.versions[0].createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(contract.versions[0].fileUrl, contract.versions[0].fileName)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(contract.versions[0].fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                  
                  <div className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center p-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Preview not available</p>
                      <p className="text-sm text-gray-400 mt-1">Click View to open the document</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No document uploaded</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push(`/contracts/${contract.id}/upload-version`)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Track changes across different versions of this contract
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/contracts/${contract.id}/upload-version`)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  New Version
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/contracts/${contract.id}/compare`)}
                  disabled={!contract.versions || contract.versions.length < 2}
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contract.versions && contract.versions.length > 0 ? (
                <VersionCompare versions={contract.versions} />
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No versions available</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push(`/contracts/${contract.id}/upload-version`)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Version
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContractDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
              <CardDescription>Key details about this contract</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 