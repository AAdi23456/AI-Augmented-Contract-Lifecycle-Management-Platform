'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ContractService, ContractUploadProgress } from '@/services/contractService';

interface EnhancedFileUploaderProps {
  onUploadComplete?: (fileUrl: string, fileName: string, result: any) => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
  showPreview?: boolean;
  autoUpload?: boolean;
}

export default function EnhancedFileUploader({
  onUploadComplete,
  acceptedFileTypes = ['.pdf', '.docx', '.doc'],
  maxFileSizeMB = 10,
  showPreview = true,
  autoUpload = false
}: EnhancedFileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Validate file type and size
  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      setErrorMessage(`Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      setErrorMessage(`File size exceeds ${maxFileSizeMB}MB limit.`);
      return false;
    }

    return true;
  }, [acceptedFileTypes, maxFileSizeMB]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setErrorMessage(null);
        
        if (autoUpload) {
          handleUpload(droppedFile);
        }
      }
    }
  }, [validateFile, autoUpload]);

  // Handle file input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setErrorMessage(null);
        
        if (autoUpload) {
          handleUpload(selectedFile);
        }
      }
    }
  }, [validateFile, autoUpload]);

  // Handle file upload
  const handleUpload = useCallback(async (fileToUpload: File | null = null) => {
    const uploadFile = fileToUpload || file;
    if (!uploadFile || !user) {
      setErrorMessage('No file selected or user not authenticated');
      return;
    }
    
    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setErrorMessage(null);
      
      // Use the ContractService to upload the file
      const result = await ContractService.uploadContract(
        uploadFile,
        user,
        (progress) => {
          setUploadProgress(progress.progress);
          setUploadStatus(progress.status);
          if (progress.error) {
            setErrorMessage(progress.error);
          }
        }
      );
      
      // Handle successful upload
      if (result.status === 'success' && result.url) {
        setFileUrl(result.url);
        
        // Call the callback if provided
        if (onUploadComplete) {
          onUploadComplete(result.url, uploadFile.name, result);
        }
        
        // Try to extract text if needed
        if (showPreview) {
          try {
            // Process contract content (extract text and generate summary)
            const { text, summary } = await ContractService.processContractContent(result.url, user);
            setExtractedText(text);
            setSummary(summary);
            
            // Store the extracted text and summary for later use
            // We'll send these to the backend when creating the contract
            result.extractedText = text;
            result.summary = summary;
          } catch (error) {
            console.warn('Contract processing error:', error);
            // Continue even if processing fails
          }
        }
        
        // Redirect to contracts page after a short delay if no callback is provided
        if (!onUploadComplete) {
          setTimeout(() => {
            router.push('/contracts');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      );
    }
  }, [file, user, onUploadComplete, showPreview, router]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage(null);
    setFileUrl(null);
    setExtractedText(null);
    setSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage(null);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${file ? 'bg-gray-50' : ''} transition-colors duration-200`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                Drag and drop your contract file here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse (PDF, DOCX, DOC)
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Select File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={acceptedFileTypes.join(',')}
              onChange={handleChange}
            />
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {uploadStatus === 'uploading' && (
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {uploadStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-5 w-5" />
                <span>Upload complete!</span>
              </div>
            )}
            
            {uploadStatus === 'error' && (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{errorMessage || 'Upload failed. Please try again.'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {uploadStatus === 'idle' && (
              <button
                type="button"
                onClick={() => handleUpload()}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Upload Contract
              </button>
            )}
          </div>
        )}
      </div>
      
      {errorMessage && uploadStatus !== 'uploading' && uploadStatus !== 'success' && uploadStatus !== 'error' && (
        <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {/* File preview section */}
      {showPreview && fileUrl && (
        <>
          {extractedText && (
            <div className="mt-6 p-4 border rounded-lg bg-white">
              <h3 className="font-medium text-lg mb-2">Contract Text</h3>
              <div className="max-h-60 overflow-y-auto p-3 bg-gray-50 rounded border text-sm">
                {extractedText}
              </div>
            </div>
          )}
          
          {summary && (
            <div className="mt-6 p-4 border rounded-lg bg-white">
              <h3 className="font-medium text-lg mb-2">Contract Summary</h3>
              <div className="p-3 bg-gray-50 rounded border text-sm space-y-2">
                {summary.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Supported file types: PDF, DOCX, DOC</p>
        <p>Maximum file size: {maxFileSizeMB}MB</p>
      </div>
    </div>
  );
}