'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedFileUploader from './EnhancedFileUploader';
import { ContractService, Contract } from '@/services/contractService';

interface ContractUploadFormProps {
  onSuccess?: (contract: Contract) => void;
}

export default function ContractUploadForm({ onSuccess }: ContractUploadFormProps) {
  const [title, setTitle] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'review' | 'active'>('draft');
  const [tags, setTags] = useState<string[]>([]);
  const [folder, setFolder] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const uploadResultRef = useRef<any>(null);

  const handleUploadComplete = useCallback((url: string, name: string, result?: any) => {
    setFileUrl(url);
    setFileName(name);
    
    // Store the upload result for later use
    if (result) {
      uploadResultRef.current = result;
      
      // Set extracted text and summary if available
      if (result.extractedText) {
        setExtractedText(result.extractedText);
      }
      
      if (result.summary) {
        setSummary(result.summary);
      }
    }
    
    // Auto-fill title with filename (without extension)
    if (!title) {
      const nameWithoutExtension = name.split('.').slice(0, -1).join('.');
      setTitle(nameWithoutExtension);
    }
  }, [title]);

  const addTag = useCallback(() => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileUrl || !user) {
      setError('Please upload a file first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format expiryDate if provided
      const formattedExpiryDate = expiryDate ? new Date(expiryDate) : undefined;
      
      // Update contract metadata
      const contractData = {
        title: title || fileName || '',
        status,
        tags,
        folder: folder || undefined,
        expiryDate: formattedExpiryDate,
        // Include extracted text and summary if available
        extractedText: uploadResultRef.current?.extractedText || extractedText,
        summary: uploadResultRef.current?.summary || summary,
        // Include file information
        fileUrl,
        originalFilename: fileName || '',
        fileType: fileName?.split('.').pop() || '',
        fileSize: uploadResultRef.current?.fileSize || 0
      };
      
      console.log('Submitting contract data:', contractData);
      
      // Create a new contract through the backend API
      try {
        // Get a fresh token to ensure it's not expired
        const idToken = await user.getIdToken(true);
        console.log('Got fresh ID token');
        
        // Make direct fetch call to API for debugging
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contractData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Direct API call error:', errorData);
          throw new Error(errorData.message || errorData.error || `API error: ${response.status}`);
        }
        
        const newContract = await response.json();
        console.log('Contract created successfully:', newContract);
        
        if (newContract) {
          // Call success callback if provided
          if (onSuccess) {
            onSuccess(newContract);
          }
          
          // Redirect to contracts page
          router.push('/contracts');
        } else {
          throw new Error('Failed to create contract metadata');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        setError(apiError instanceof Error ? apiError.message : 'Failed to create contract metadata');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [fileUrl, user, title, fileName, status, tags, folder, expiryDate, onSuccess, router, extractedText, summary]);

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">Upload Contract File</h2>
        <EnhancedFileUploader
          onUploadComplete={handleUploadComplete}
          acceptedFileTypes={['.pdf', '.docx', '.doc']}
          maxFileSizeMB={10}
          showPreview={true}
        />
      </div>
      
      {/* Metadata Form Section */}
      {fileUrl && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Contract Details</h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Contract Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter contract title"
              />
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="active">Active</option>
              </select>
            </div>
            
            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Folder */}
            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-gray-700">
                Folder (Optional)
              </label>
              <input
                type="text"
                id="folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Vendors, Clients, HR"
              />
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <div className="flex mt-1">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add tags"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              
              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !fileUrl}
                className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  loading || !fileUrl
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Saving...' : 'Save Contract'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}