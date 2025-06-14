'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/app/providers/AuthProvider';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';

interface FileUploaderProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileType: string) => void;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

export default function FileUploader({ 
  onUploadComplete, 
  acceptedFileTypes = ['.pdf', '.docx', '.doc'],
  maxSizeMB = 10
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const { user } = useAuth();
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const selectedFile = acceptedFiles[0];
    
    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      setUploadError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }
    
    // Check file type
    const fileExtension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(fileExtension)) {
      setUploadError(`File type not supported. Please upload ${acceptedFileTypes.join(', ')}.`);
      return;
    }
    
    setFile(selectedFile);
    setUploadComplete(false);
  }, [acceptedFileTypes, maxSizeBytes, maxSizeMB]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false
  });
  
  const handleUpload = async () => {
    if (!file || !user) return;
    
    try {
      setUploading(true);
      setUploadError(null);
      
      const storage = getStorage();
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `contracts/${user.uid}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadError('Failed to upload file. Please try again.');
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadComplete(true);
            setUploading(false);
            onUploadComplete(downloadURL, file.name, fileExtension || '');
          } catch (error) {
            console.error('Error getting download URL:', error);
            setUploadError('Failed to complete upload. Please try again.');
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('An unexpected error occurred. Please try again.');
      setUploading(false);
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setUploadComplete(false);
    setUploadProgress(0);
    setUploadError(null);
  };
  
  return (
    <div className="space-y-4">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              Supports {acceptedFileTypes.join(', ')} (Max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-right">{Math.round(uploadProgress)}%</p>
            </div>
          )}
          
          {uploadComplete && (
            <div className="flex items-center text-green-600 text-sm mt-2">
              <Check className="h-4 w-4 mr-1" />
              <span>Upload complete</span>
            </div>
          )}
          
          {!uploading && !uploadComplete && (
            <Button 
              onClick={handleUpload} 
              className="w-full mt-2"
              size="sm"
            >
              Upload File
            </Button>
          )}
        </div>
      )}
      
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 