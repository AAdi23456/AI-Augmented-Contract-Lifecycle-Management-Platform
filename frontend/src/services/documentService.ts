import { apiClient } from './apiConfig';

export interface DocumentMetadata {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractedText?: string;
  summary?: string;
  tags?: string[];
}

export interface CreateDocumentDto {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  tags?: string[];
}

export const extractTextFromDocument = async (fileUrl: string): Promise<string> => {
  const response = await apiClient.post('/documents/extract-text', { fileUrl });
  return response.data.extractedText;
};

export const generateSummary = async (text: string): Promise<string> => {
  const response = await apiClient.post('/documents/summarize', { text });
  return response.data.summary;
};

export const createDocument = async (documentData: CreateDocumentDto): Promise<DocumentMetadata> => {
  const response = await apiClient.post('/documents', documentData);
  return response.data;
};

export const getDocuments = async (
  status?: string,
  tag?: string,
  search?: string
): Promise<DocumentMetadata[]> => {
  let url = '/documents';
  const params = new URLSearchParams();
  
  if (status) params.append('status', status);
  if (tag) params.append('tag', tag);
  if (search) params.append('search', search);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  const response = await apiClient.get(url);
  return response.data;
};

export const getDocument = async (id: string): Promise<DocumentMetadata> => {
  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
};

export const updateDocument = async (
  id: string, 
  updateData: Partial<DocumentMetadata>
): Promise<DocumentMetadata> => {
  const response = await apiClient.patch(`/documents/${id}`, updateData);
  return response.data;
}; 