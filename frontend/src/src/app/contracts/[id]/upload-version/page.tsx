'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import FileUploader from '@/components/uploads/FileUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function UploadVersionPage() {
  const [contract, setContract] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleUploadComplete = (uploadedFileUrl: string, uploadedFileName: string, uploadedFileType: string) => {
    setFileUrl(uploadedFileUrl);
    setFileName(uploadedFileName);
    setFileType(uploadedFileType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileUrl || !user) {
      setError('No file has been uploaded yet.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileUrl,
          fileName,
          fileType
        })
      });

      if (response.ok) {
        router.push(`/contracts/${contractId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload new version');
      }
    } catch (err) {
      console.error('Error uploading version:', err);
      setError('An error occurred while uploading the new version.');
    } finally {
      setIsSubmitting(false);
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
      
      <h1 className="text-2xl font-bold mb-6">Upload New Version</h1>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>1. Upload Document</CardTitle>
                <CardDescription>Upload a new version of "{contract?.title}"</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onUploadComplete={handleUploadComplete} />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>2. Confirm Upload</CardTitle>
                <CardDescription>Review and confirm the new version</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {fileUrl && fileName && (
                    <div className="p-3 bg-gray-50 rounded text-sm border">
                      <p className="font-medium">File uploaded:</p>
                      <p className="text-gray-600 truncate">{fileName}</p>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!fileUrl || isSubmitting}
                  >
                    {isSubmitting ? 'Uploading Version...' : 'Upload New Version'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 