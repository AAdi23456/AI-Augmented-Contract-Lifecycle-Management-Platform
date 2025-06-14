import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VersionCompare from '@/components/contracts/VersionCompare';

// Mock date-fns to avoid date formatting issues in tests
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'Jan 1, 2023'),
}));

// Sample test data
const mockVersions = [
  {
    id: 'v1',
    fileUrl: 'https://example.com/file1.pdf',
    fileName: 'contract-v1.pdf',
    fileType: 'pdf',
    versionNumber: 1,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'v2',
    fileUrl: 'https://example.com/file2.pdf',
    fileName: 'contract-v2.pdf',
    fileType: 'pdf',
    versionNumber: 2,
    createdAt: '2023-02-01T00:00:00Z',
  },
  {
    id: 'v3',
    fileUrl: 'https://example.com/file3.pdf',
    fileName: 'contract-v3.pdf',
    fileType: 'pdf',
    versionNumber: 3,
    createdAt: '2023-03-01T00:00:00Z',
  },
];

// Mock functions
const mockGenerateDiff = jest.fn().mockResolvedValue('Mocked diff content');
const mockOpen = jest.fn();
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();

// Setup and cleanup
beforeEach(() => {
  // Mock window.open
  window.open = mockOpen;
  
  // Mock document methods for download functionality
  document.createElement = mockCreateElement;
  document.body.appendChild = mockAppendChild;
  document.body.removeChild = mockRemoveChild;
  
  // Mock link element
  mockCreateElement.mockReturnValue({
    href: '',
    download: '',
    click: mockClick,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('VersionCompare Component', () => {
  test('renders version list correctly', () => {
    render(<VersionCompare versions={mockVersions} />);
    
    // Check if all versions are displayed
    expect(screen.getByText('Version 1 (Original)')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('Version 3')).toBeInTheDocument();
    
    // Check if dates are formatted
    expect(screen.getAllByText('Jan 1, 2023').length).toBe(3);
    
    // Check if filenames are displayed
    expect(screen.getByText('contract-v1.pdf')).toBeInTheDocument();
    expect(screen.getByText('contract-v2.pdf')).toBeInTheDocument();
    expect(screen.getByText('contract-v3.pdf')).toBeInTheDocument();
  });

  test('handles download button click', () => {
    render(<VersionCompare versions={mockVersions} />);
    
    // Find and click the first download button
    const downloadButtons = screen.getAllByText('Download');
    fireEvent.click(downloadButtons[0]);
    
    // Check if link was created and clicked
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  test('handles view button click', () => {
    render(<VersionCompare versions={mockVersions} />);
    
    // Find and click the first view button
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    
    // Check if window.open was called with correct URL
    expect(mockOpen).toHaveBeenCalledWith('https://example.com/file1.pdf', '_blank');
  });

  test('shows alert when less than 2 versions are available', () => {
    const singleVersion = [mockVersions[0]];
    render(<VersionCompare versions={singleVersion} />);
    
    // Check if alert message is displayed
    expect(screen.getByText(/at least two versions are required/i)).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<VersionCompare versions={mockVersions} isLoading={true} />);
    
    // Check if skeletons are rendered
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
}); 