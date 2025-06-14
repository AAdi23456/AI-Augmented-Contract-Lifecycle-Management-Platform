import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the Firebase ID token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = 
      error.response?.data?.message || 
      error.message || 
      'An unknown error occurred';
    
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Auth
  getCurrentUser: () => axiosInstance.get('/auth/me'),
  
  // Contracts
  getContracts: () => axiosInstance.get('/contracts'),
  getContract: (id: string) => axiosInstance.get(`/contracts/${id}`),
  createContract: (data: FormData) => axiosInstance.post('/contracts', data),
  updateContract: (id: string, data: any) => axiosInstance.put(`/contracts/${id}`, data),
  deleteContract: (id: string) => axiosInstance.delete(`/contracts/${id}`),
  
  // Contract Versions
  getContractVersions: (contractId: string) => axiosInstance.get(`/contracts/${contractId}/versions`),
  addContractVersion: (contractId: string, data: FormData) => 
    axiosInstance.post(`/contracts/${contractId}/versions`, data),
  
  // Contract Summaries
  getContractSummary: (contractId: string) => axiosInstance.get(`/contracts/${contractId}/summary`),
  generateContractSummary: (contractId: string) => axiosInstance.post(`/contracts/${contractId}/summary`),
  
  // Contract Clauses
  getContractClauses: (contractId: string) => axiosInstance.get(`/contracts/${contractId}/clauses`),
  
  // Contract Risk Terms
  getContractRiskTerms: (contractId: string) => axiosInstance.get(`/contracts/${contractId}/risk-terms`),
  
  // Contract Q&A
  askContractQuestion: (contractId: string, question: string) => 
    axiosInstance.post(`/contracts/${contractId}/qa`, { question }),
};

// Reminder endpoints
export const getContractReminders = async (contractId: string) => {
  const response = await axiosInstance.get(`/reminders/contract/${contractId}`);
  return response.data;
};

export const createReminder = async (data: {
  contractId: string;
  sendOn: string;
  message: string;
}) => {
  const response = await axiosInstance.post('/reminders', data);
  return response.data;
};

export const updateReminder = async (
  id: string,
  data: {
    contractId?: string;
    sendOn?: string;
    message?: string;
    isActive?: boolean;
  }
) => {
  const response = await axiosInstance.put(`/reminders/${id}`, data);
  return response.data;
};

export const deleteReminder = async (id: string) => {
  const response = await axiosInstance.delete(`/reminders/${id}`);
  return response.data;
};

export const getMyReminders = async () => {
  const response = await axiosInstance.get('/reminders/my');
  return response.data;
};

// Redlining endpoints
export const getRedlinesByContract = async (contractId: string) => {
  const response = await axiosInstance.get(`/redlining/redlines/contract/${contractId}`);
  return response.data;
};

export const getRedlinesByClause = async (clauseId: string) => {
  const response = await axiosInstance.get(`/redlining/redlines/clause/${clauseId}`);
  return response.data;
};

export const getRedlinesByVersion = async (versionId: string) => {
  const response = await axiosInstance.get(`/redlining/redlines/version/${versionId}`);
  return response.data;
};

export const createRedline = async (data: {
  contractId: string;
  clauseId?: string;
  contractVersionId?: string;
  originalText: string;
  suggestedText: string;
  position?: string;
  reason?: string;
}) => {
  const response = await axiosInstance.post('/redlining/redlines', data);
  return response.data;
};

export const updateRedlineStatus = async (id: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED') => {
  const response = await axiosInstance.put(`/redlining/redlines/${id}/status`, { status });
  return response.data;
};

export const deleteRedline = async (id: string) => {
  const response = await axiosInstance.delete(`/redlining/redlines/${id}`);
  return response.data;
};

export const getCommentsByContract = async (contractId: string) => {
  const response = await axiosInstance.get(`/redlining/comments/contract/${contractId}`);
  return response.data;
};

export const getCommentsByClause = async (clauseId: string) => {
  const response = await axiosInstance.get(`/redlining/comments/clause/${clauseId}`);
  return response.data;
};

export const getCommentsByVersion = async (versionId: string) => {
  const response = await axiosInstance.get(`/redlining/comments/version/${versionId}`);
  return response.data;
};

export const createComment = async (data: {
  contractId: string;
  clauseId?: string;
  contractVersionId?: string;
  text: string;
  position?: string;
}) => {
  const response = await axiosInstance.post('/redlining/comments', data);
  return response.data;
};

export const updateComment = async (id: string, data: {
  text?: string;
  position?: string;
}) => {
  const response = await axiosInstance.put(`/redlining/comments/${id}`, data);
  return response.data;
};

export const deleteComment = async (id: string) => {
  const response = await axiosInstance.delete(`/redlining/comments/${id}`);
  return response.data;
}; 