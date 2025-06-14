import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './ui/use-toast';

interface BulletPoint {
  point: string;
  importance: number; // 1-5, with 5 being most important
}

interface ContractSummary {
  id: string;
  contractId: string;
  summaryText: string;
  bulletPoints?: BulletPoint[];
  createdAt: string;
}

interface ContractSummaryProps {
  contractId: string;
  initialSummary?: ContractSummary;
}

export function ContractSummary({ contractId, initialSummary }: ContractSummaryProps) {
  const [summary, setSummary] = useState<ContractSummary | undefined>(initialSummary);
  const [loading, setLoading] = useState<boolean>(!initialSummary);
  const [generating, setGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch summary if not provided initially
  React.useEffect(() => {
    if (!initialSummary) {
      fetchSummary();
    }
  }, [initialSummary, contractId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await api.get<ContractSummary>(`/contracts/${contractId}/summary`);
      setSummary(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch contract summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewSummary = async () => {
    try {
      setGenerating(true);
      const data = await api.post<ContractSummary>(`/contracts/${contractId}/summary`);
      setSummary(data);
      toast({
        title: 'Success',
        description: 'Generated new contract summary',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate new summary',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Sort bullet points by importance (highest first)
  const sortedBulletPoints = summary?.bulletPoints
    ? [...summary.bulletPoints].sort((a, b) => b.importance - a.importance)
    : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Contract Summary</CardTitle>
          <CardDescription>
            {summary ? `Generated on ${new Date(summary.createdAt).toLocaleDateString()}` : 'AI-generated summary'}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateNewSummary}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {sortedBulletPoints.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Key Points</h3>
                <ul className="space-y-3">
                  {sortedBulletPoints.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {bullet.importance}
                      </div>
                      <p>{bullet.point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Summary</h3>
                <p className="whitespace-pre-line">{summary.summaryText}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">No summary available</p>
        )}
      </CardContent>
      {summary?.bulletPoints?.length ? (
        <CardFooter className="pt-0">
          <p className="text-xs text-gray-500">
            Points are ranked by importance (5 = most important, 1 = least important)
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
} 