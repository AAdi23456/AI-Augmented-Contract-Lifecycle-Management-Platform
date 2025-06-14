import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import UploadVersionPage from '@/app/contracts/[id]/upload-version/page';
import { useAuth } from '@/app/providers/AuthProvider';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/uploads/FileUploader', () => {
  return function MockFileUploader({ onUploadComplete }) {
    return (
      <div data-testid="file-uploader">
        <button 
          onClick={() => onUploadComplete('https://example.com/file.pdf', 'test-file.pdf', 'pdf')}
          data-testid="mock-upload-button"
        >
          Mock Upload
        </button>
      </div>
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('UploadVersionPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };
  
  const mockUser = { id: 'user1', email: 'test@example.com' };
  const mockGetToken = jest.fn().mockResolvedValue('mock-token');
  
  beforeEach(() => {
    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: 'contract123' });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, getToken: mockGetToken });
    
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });
  
  test('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<UploadVersionPage />);
    
    expect(screen.getByText(/back to contract/i)).toBeInTheDocument();
    expect(screen.getByText(/upload new version/i)).toBeInTheDocument();
    
    // Check for loading skeleton
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
  
  test('fetches contract data on load', async () => {
    const mockContract = {
      id: 'contract123',
      title: 'Test Contract',
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockContract,
    });
    
    render(<UploadVersionPage />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/contracts/contract123'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });
  });
  
  test('handles file upload completion', async () => {
    const mockContract = {
      id: 'contract123',
      title: 'Test Contract',
    };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockContract,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'version1' }),
      });
    
    render(<UploadVersionPage />);
    
    // Wait for contract to load
    await waitFor(() => {
      expect(screen.queryByTestId('file-uploader')).toBeInTheDocument();
    });
    
    // Trigger file upload
    fireEvent.click(screen.getByTestId('mock-upload-button'));
    
    // Check if file info is displayed
    expect(screen.getByText(/test-file.pdf/i)).toBeInTheDocument();
    
    // Submit the form
    const submitButton = screen.getByText(/upload new version$/i);
    fireEvent.click(submitButton);
    
    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/contracts/contract123/versions'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }),
          body: JSON.stringify({
            fileUrl: 'https://example.com/file.pdf',
            fileName: 'test-file.pdf',
            fileType: 'pdf'
          })
        })
      );
    });
    
    // Check if redirect happened
    expect(mockRouter.push).toHaveBeenCalledWith('/contracts/contract123');
  });
  
  test('handles API errors', async () => {
    const mockContract = {
      id: 'contract123',
      title: 'Test Contract',
    };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockContract,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Upload failed' }),
      });
    
    render(<UploadVersionPage />);
    
    // Wait for contract to load
    await waitFor(() => {
      expect(screen.queryByTestId('file-uploader')).toBeInTheDocument();
    });
    
    // Trigger file upload
    fireEvent.click(screen.getByTestId('mock-upload-button'));
    
    // Submit the form
    const submitButton = screen.getByText(/upload new version$/i);
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
    
    // Check that no redirect happened
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
  
  test('redirects to login if no user', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, getToken: mockGetToken });
    
    render(<UploadVersionPage />);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
  });
}); 