'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/uploads/FileUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

export default function UploadContractPage() {
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, getToken } = useAuth();
  const router = useRouter();

  const handleUploadComplete = (uploadedFileUrl: string, uploadedFileName: string, uploadedFileType: string) => {
    setFileUrl(uploadedFileUrl);
    setFileName(uploadedFileName);
    setFileType(uploadedFileType);
    
    // Auto-generate a title based on filename
    const nameWithoutExtension = uploadedFileName.split('.').slice(0, -1).join('.');
    setTitle(nameWithoutExtension);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileUrl || !user) {
      setError('No file has been uploaded yet.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title for the contract.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          uploadedFileUrl: fileUrl,
          fileName,
          fileType
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/contracts/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create contract');
      }
    } catch (err) {
      console.error('Error creating contract:', err);
      setError('An error occurred while creating the contract.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload New Contract</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>1. Upload Document</CardTitle>
              <CardDescription>Upload a PDF or Word document of your contract</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>2. Contract Details</CardTitle>
              <CardDescription>Enter information about your contract</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Contract Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter contract title"
                    required
                    disabled={!fileUrl || isSubmitting}
                  />
                </div>

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
                  {isSubmitting ? 'Creating Contract...' : 'Create Contract'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 