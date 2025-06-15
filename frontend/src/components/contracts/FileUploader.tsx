'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/config/firebase-config';
import { useAuth } from '@/contexts/AuthContext';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Fallback API URL if environment variable is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileUploaderProps {
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export default function FileUploader({
  onUploadComplete,
  acceptedFileTypes = ['.pdf', '.docx', '.doc'],
  maxFileSizeMB = 10
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
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
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setErrorMessage('');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setErrorMessage('');
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !user) return;
    
    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      // Create a storage reference
      const storageRef = ref(storage, `contracts/${user.uid}/${Date.now()}_${file.name}`);
      
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Listen for upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadStatus('error');
          setErrorMessage('Failed to upload file. Please try again.');
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save contract metadata to backend
          try {
            // Try to save to backend, but continue even if it fails
            try {
              const response = await fetch(`${API_URL}/contracts`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({
                  title: file.name,
                  originalFilename: file.name,
                  fileUrl: downloadURL,
                  fileType: file.type,
                  fileSize: file.size
                })
              });
              
              if (!response.ok) {
                console.warn('Backend API not available or returned an error');
              }
            } catch (apiError) {
              console.warn('Backend API error:', apiError);
              // Continue even if backend API is not available
            }
            
            // Mark as success even if backend API failed
            setUploadStatus('success');
            
            // Call the callback if provided
            if (onUploadComplete) {
              onUploadComplete(downloadURL, file.name);
            }
            
            // Redirect to contracts page after a short delay
            setTimeout(() => {
              router.push('/contracts');
            }, 2000);
            
          } catch (error) {
            console.error('API error:', error);
            setUploadStatus('error');
            setErrorMessage('Failed to save contract metadata. Please try again.');
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{errorMessage || 'Upload failed. Please try again.'}</span>
              </div>
            )}
            
            {uploadStatus === 'idle' && (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Upload Contract
              </button>
            )}
          </div>
        )}
      </div>
      
      {errorMessage && uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
        <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Supported file types: PDF, DOCX, DOC</p>
        <p>Maximum file size: {maxFileSizeMB}MB</p>
      </div>
    </div>
  );
} 