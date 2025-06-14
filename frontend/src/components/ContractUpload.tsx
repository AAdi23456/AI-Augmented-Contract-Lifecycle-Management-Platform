import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileUpload } from './FileUpload';
import { uploadFile } from '../services/api';
import { useToast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ContractData {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
  status: string;
}

interface ContractUploadProps {
  onSuccess?: (contract: ContractData) => void;
}

export function ContractUpload({ onSuccess }: ContractUploadProps) {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError('');
    // Auto-fill title from filename if empty
    if (!title) {
      setTitle(file.name.split('.')[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError('');
  };

  const simulateProgress = () => {
    // Simulate upload progress (in a real app, this would come from an upload progress event)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(Math.min(progress, 95)); // Cap at 95% until actual completion
      if (progress >= 95) {
        clearInterval(interval);
      }
    }, 200);
    return interval;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    if (!title.trim()) {
      setUploadError('Please enter a contract title');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      // Simulate progress updates
      const progressInterval = simulateProgress();

      // Upload the contract
      const formData = {
        title,
      };

      const response = await uploadFile<ContractData>('/contracts', selectedFile, formData);

      // Clear the progress simulation
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: 'Contract uploaded',
        description: 'Your contract has been uploaded successfully.',
      });

      // Reset the form
      setTitle('');
      setSelectedFile(null);
      setUploadProgress(0);

      // Call the success callback
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload contract');
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload contract',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Contract</CardTitle>
        <CardDescription>
          Upload a contract document to add it to your repository.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Contract Title</Label>
            <Input
              id="title"
              placeholder="Enter contract title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label>Contract File</Label>
            <FileUpload
              onFileSelect={handleFileSelect}
              onClear={handleClearFile}
              acceptedFileTypes=".pdf,.doc,.docx"
              maxSizeMB={10}
              uploading={uploading}
              progress={uploadProgress}
              error={uploadError}
              selectedFile={selectedFile}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={uploading || !selectedFile}>
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {uploading ? 'Uploading...' : 'Upload Contract'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 