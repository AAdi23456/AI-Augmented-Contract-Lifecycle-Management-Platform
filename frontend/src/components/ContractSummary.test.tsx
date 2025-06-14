import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ContractSummary } from './ContractSummary';
import { api } from '../services/api';
import { mockToast } from '../test/mockToast';
import { vi } from 'vitest';

// Mock the API
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../services/api', () => ({
  api: {
    get: mockGet,
    post: mockPost,
  },
}));

// Mock the useToast hook
vi.mock('./ui/use-toast', () => ({
  useToast: () => mockToast,
}));

describe('ContractSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInitialSummary = {
    id: 'summary-1',
    contractId: 'contract-1',
    summaryText: 'This is a test summary.',
    bulletPoints: [
      { point: 'First important point', importance: 5 },
      { point: 'Second important point', importance: 4 },
      { point: 'Third important point', importance: 3 },
      { point: 'Fourth important point', importance: 2 },
      { point: 'Fifth important point', importance: 1 },
    ],
    createdAt: '2023-06-15T12:00:00Z',
  };

  it('renders with initial summary data', () => {
    render(<ContractSummary contractId="contract-1" initialSummary={mockInitialSummary} />);

    // Check title and date are displayed
    expect(screen.getByText('Contract Summary')).toBeInTheDocument();
    expect(screen.getByText(/Generated on/)).toBeInTheDocument();

    // Check bullet points are displayed in order of importance
    const bulletPoints = screen.getAllByRole('listitem');
    expect(bulletPoints).toHaveLength(5);
    expect(bulletPoints[0]).toHaveTextContent('First important point');
    expect(bulletPoints[4]).toHaveTextContent('Fifth important point');

    // Check importance indicators are displayed
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Check regenerate button is present
    expect(screen.getByRole('button', { name: /Regenerate/i })).toBeInTheDocument();
  });

  it('renders with text summary when no bullet points are available', () => {
    const summaryWithoutBullets = {
      ...mockInitialSummary,
      bulletPoints: undefined,
    };

    render(<ContractSummary contractId="contract-1" initialSummary={summaryWithoutBullets} />);

    // Check summary text is displayed
    expect(screen.getByText('This is a test summary.')).toBeInTheDocument();
  });

  it('fetches summary when no initial summary is provided', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce(mockInitialSummary);

    render(<ContractSummary contractId="contract-1" />);

    // Should show loading state initially
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/contracts/contract-1/summary');
      expect(screen.getByText('First important point')).toBeInTheDocument();
    });
  });

  it('shows error toast when fetch fails', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<ContractSummary contractId="contract-1" />);

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        })
      );
    });
  });

  it('generates new summary when regenerate button is clicked', async () => {
    const newSummary = {
      ...mockInitialSummary,
      id: 'summary-2',
      bulletPoints: [
        { point: 'New first point', importance: 5 },
        { point: 'New second point', importance: 4 },
        { point: 'New third point', importance: 3 },
        { point: 'New fourth point', importance: 2 },
        { point: 'New fifth point', importance: 1 },
      ],
    };

    (api.post as jest.Mock).mockResolvedValueOnce(newSummary);

    render(<ContractSummary contractId="contract-1" initialSummary={mockInitialSummary} />);

    // Click regenerate button
    const regenerateButton = screen.getByRole('button', { name: /Regenerate/i });
    fireEvent.click(regenerateButton);

    // Should show loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument();

    // Wait for new data
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/contracts/contract-1/summary');
      expect(screen.getByText('New first point')).toBeInTheDocument();
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success',
          description: 'Generated new contract summary',
        })
      );
    });
  });

  it('shows error toast when generation fails', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Failed to generate'));

    render(<ContractSummary contractId="contract-1" initialSummary={mockInitialSummary} />);

    // Click regenerate button
    const regenerateButton = screen.getByRole('button', { name: /Regenerate/i });
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        })
      );
    });
  });

  it('renders no summary message when no data is available', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce(null);

    render(<ContractSummary contractId="contract-1" />);

    await waitFor(() => {
      expect(screen.getByText('No summary available')).toBeInTheDocument();
    });
  });
}); 