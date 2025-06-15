import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/config/firebase-config';
import { User } from 'firebase/auth';
import { API_ENDPOINTS, createAuthHeaders, handleApiResponse } from '@/config/api-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export interface ContractUploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  contractId?: string;
  extractedText?: string;
  summary?: string;
}

export interface ContractMetadata {
  title: string;
  originalFilename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  userId: string;
  uploadedAt: Date;
  extractedText?: string;
  summary?: string;
}

export interface Contract extends ContractMetadata {
  id: string;
  status: 'draft' | 'review' | 'active' | 'expired';
  expiryDate?: Date;
  tags?: string[];
  folder?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContractService {
  /**
   * Upload a contract file to Firebase Storage
   * @param file The file to upload
   * @param user The authenticated user
   * @param onProgress Callback for upload progress
   */
  static async uploadContract(
    file: File, 
    user: User,
    onProgress?: (progress: ContractUploadProgress) => void
  ): Promise<ContractUploadProgress> {
    try {
      if (!file || !user) {
        throw new Error('File and user are required');
      }
      
      // Create a unique filename with timestamp and random ID to avoid collisions
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `contracts/${user.uid}/${timestamp}_${randomId}_${safeFileName}`;
      const storageRef = ref(storage, filePath);
      
      console.log('Uploading file to Firebase Storage:', filePath);
      
      // Start the upload
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Return a promise that resolves when the upload is complete
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Update progress
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) {
              onProgress({
                progress,
                status: 'uploading'
              });
            }
          },
          (error) => {
            // Handle upload error
            console.error('Upload error:', error);
            const result = {
              progress: 0,
              status: 'error' as const,
              error: 'Failed to upload file. Please try again.'
            };
            if (onProgress) onProgress(result);
            reject(result);
          },
          async () => {
            // Upload completed successfully
            try {
              // Get download URL using Firebase client SDK
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Use the public URL since we can't use Admin SDK in the browser
              let secureUrl = downloadURL;
              
              // Try to get a signed URL via API if available
              try {
                const response = await fetch('/api/storage/signed-url', {
                  method: 'POST',
                  headers: createAuthHeaders(await user.getIdToken()),
                  body: JSON.stringify({ filePath })
                });
                
                if (response.ok) {
                  const data = await response.json();
                  if (data.url) {
                    secureUrl = data.url;
                  }
                }
              } catch (signedUrlError) {
                console.warn('Could not generate signed URL, using public URL instead:', signedUrlError);
              }
              
              // Create contract metadata
              const metadata: ContractMetadata = {
                title: file.name,
                originalFilename: file.name,
                fileUrl: secureUrl,
                fileType: file.type,
                fileSize: file.size,
                userId: user.uid,
                uploadedAt: new Date()
              };
              
              // Try to extract text and generate summary
              try {
                const { text, summary } = await this.processContractContent(secureUrl, user);
                metadata.extractedText = text;
                metadata.summary = summary;
                
                // Return success result with extracted text and summary
                const result = {
                  progress: 100,
                  status: 'success' as const,
                  url: secureUrl,
                  fileSize: file.size,
                  extractedText: text,
                  summary: summary
                };
                if (onProgress) onProgress(result);
                resolve(result);
              } catch (processingError) {
                console.warn('Content processing error:', processingError);
                // Continue even if processing fails
                
                // Return success result without extracted text and summary
                const result = {
                  progress: 100,
                  status: 'success' as const,
                  url: secureUrl,
                  fileSize: file.size
                };
                if (onProgress) onProgress(result);
                resolve(result);
              }
            } catch (error) {
              console.error('Error getting download URL:', error);
              const result = {
                progress: 0,
                status: 'error' as const,
                error: 'Failed to get download URL. Please try again.'
              };
              if (onProgress) onProgress(result);
              reject(result);
            }
          }
        );
      });
    } catch (error) {
      console.error('Contract upload error:', error);
      const result = {
        progress: 0,
        status: 'error' as const,
        error: 'An unexpected error occurred. Please try again.'
      };
      if (onProgress) onProgress(result);
      return Promise.reject(result);
    }
  }

  /**
   * Extract text from a contract file
   * @param fileUrl The URL of the file to extract text from
   * @param user The authenticated user
   */
  static async extractContractText(fileUrl: string, user: User): Promise<string> {
    try {
      const response = await fetch(API_ENDPOINTS.EXTRACT_TEXT, {
        method: 'POST',
        headers: createAuthHeaders(await user.getIdToken()),
        body: JSON.stringify({ fileUrl })
      });
      
      await handleApiResponse(response);
      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to extract text from the contract. Please try again.');
    }
  }

  /**
   * Generate a summary of contract text using GPT-3.5
   * @param text The contract text to summarize
   * @param user The authenticated user
   * @returns A summary of the contract
   */
  static async summarizeContractText(text: string, user: User): Promise<string> {
    try {
      const response = await fetch(API_ENDPOINTS.SUMMARIZE_TEXT, {
        method: 'POST',
        headers: createAuthHeaders(await user.getIdToken()),
        body: JSON.stringify({ text })
      });
      
      await handleApiResponse(response);
      const data = await response.json();
      return data.summary || '';
    } catch (error) {
      console.error('Summarization error:', error);
      throw new Error('Failed to generate contract summary. Please try again.');
    }
  }

  /**
   * Get all contracts for a user
   * @param user The authenticated user
   */
  static async getUserContracts(user: User): Promise<Contract[]> {
    try {
      // Try to get contracts from backend
      try {
        const response = await fetch(API_ENDPOINTS.USER_CONTRACTS(user.uid), {
          method: 'GET',
          headers: createAuthHeaders(await user.getIdToken())
        });
        
        await handleApiResponse(response);
        return await response.json();
      } catch (apiError) {
        console.warn('Backend API error:', apiError);
        // Return empty array if backend API is not available
        return [];
      }
    } catch (error) {
      console.error('Get contracts error:', error);
      return [];
    }
  }

  /**
   * Get a contract by ID
   * @param contractId The ID of the contract to get
   * @param user The authenticated user
   */
  static async getContractById(contractId: string, user: User): Promise<Contract | null> {
    try {
      const response = await fetch(API_ENDPOINTS.CONTRACT_BY_ID(contractId), {
        method: 'GET',
        headers: createAuthHeaders(await user.getIdToken())
      });
      
      await handleApiResponse(response);
      return await response.json();
    } catch (error) {
      console.error('Get contract error:', error);
      return null;
    }
  }

  /**
   * Update a contract
   * @param contractId The ID of the contract to update
   * @param updates The updates to apply
   * @param user The authenticated user
   */
  static async updateContract(contractId: string, updates: Partial<Contract>, user: User): Promise<Contract | null> {
    try {
      const response = await fetch(API_ENDPOINTS.CONTRACT_BY_ID(contractId), {
        method: 'PATCH',
        headers: createAuthHeaders(await user.getIdToken()),
        body: JSON.stringify(updates)
      });
      
      await handleApiResponse(response);
      return await response.json();
    } catch (error) {
      console.error('Update contract error:', error);
      return null;
    }
  }

  /**
   * Extract text and generate summary for a contract
   * @param fileUrl The URL of the file
   * @param user The authenticated user
   */
  static async processContractContent(fileUrl: string, user: User): Promise<{ text: string; summary: string }> {
    // Extract text from the contract
    const text = await this.extractContractText(fileUrl, user);
    
    // Generate summary using GPT-3.5
    const summary = await this.summarizeContractText(text, user);
    
    return { text, summary };
  }

  /**
   * Create a new contract
   * @param contractData The contract data
   * @param user The authenticated user
   */
  static async createContract(contractData: Partial<ContractMetadata>, user: User): Promise<Contract | null> {
    try {
      // Get the ID token
      const idToken = await user.getIdToken();
      
      // Call the upload API endpoint
      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(contractData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error creating contract:', errorData);
        throw new Error(errorData.error || 'Failed to create contract');
      }
      
      const data = await response.json();
      return data.contract;
    } catch (error) {
      console.error('Contract creation error:', error);
      return null;
    }
  }
} 