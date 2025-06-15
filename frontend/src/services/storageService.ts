import { apiClient } from './apiConfig';

export interface UploadResponse {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/storage/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getDownloadUrl = async (fileUrl: string): Promise<string> => {
  const response = await apiClient.get(`/storage/download-url?fileUrl=${encodeURIComponent(fileUrl)}`);
  return response.data.downloadUrl;
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  await apiClient.delete(`/storage/delete?fileUrl=${encodeURIComponent(fileUrl)}`);
}; 