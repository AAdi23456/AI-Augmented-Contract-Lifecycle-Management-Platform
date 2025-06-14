import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { ClauseHighlighter } from './ClauseHighlighter';

interface ClauseExtractionProps {
  contractId: string;
  contractText: string;
  onExtracted?: (clauses: any[]) => void;
}

export function ClauseExtraction({ contractId, contractText, onExtracted }: ClauseExtractionProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [clauses, setClauses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedClause, setSelectedClause] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'highlight'>('list');
  const { toast } = useToast();

  const extractClauses = async () => {
    setIsExtracting(true);
    try {
      const response = await api.post('/clauses/extract', {
        contractId,
        contractText,
      });
      
      setClauses(response.data);
      if (onExtracted) {
        onExtracted(response.data);
      }
      
      toast({
        title: "Clauses extracted successfully",
        description: `${response.data.length} clauses were found in the contract.`,
      });
    } catch (error) {
      console.error('Error extracting clauses:', error);
      toast({
        title: "Failed to extract clauses",
        description: "An error occurred while extracting clauses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const getRiskBadge = (riskScore: string) => {
    switch (riskScore) {
      case 'HIGH':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'LOW':
        return <Badge variant="success">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredClauses = activeTab === 'all' 
    ? clauses 
    : clauses.filter(clause => clause.riskScore === activeTab);

  const handleClauseClick = (clause: any) => {
    setSelectedClause(clause);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contract Clause Extraction</CardTitle>
            <CardDescription>
              Extract key clauses from the contract using AI and analyze their risk levels.
            </CardDescription>
          </div>
          {clauses.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
              <Button 
                variant={viewMode === 'highlight' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('highlight')}
              >
                Highlight View
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {clauses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 text-muted-foreground">
              {isExtracting ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : (
                <div className="rounded-full bg-muted p-3">
                  <AlertCircle className="h-8 w-8" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold">
              {isExtracting ? 'Extracting clauses...' : 'No clauses extracted yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {isExtracting 
                ? 'Our AI is analyzing the contract to identify key clauses and assess risk levels.' 
                : 'Click the button below to extract clauses from this contract.'}
            </p>
            {!isExtracting && (
              <Button onClick={extractClauses} disabled={isExtracting}>
                {isExtracting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Extract Clauses
              </Button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Clauses ({clauses.length})</TabsTrigger>
                <TabsTrigger value="HIGH">High Risk ({clauses.filter(c => c.riskScore === 'HIGH').length})</TabsTrigger>
                <TabsTrigger value="MEDIUM">Medium Risk ({clauses.filter(c => c.riskScore === 'MEDIUM').length})</TabsTrigger>
                <TabsTrigger value="LOW">Low Risk ({clauses.filter(c => c.riskScore === 'LOW').length})</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                <div className="space-y-4">
                  {filteredClauses.map((clause, index) => (
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{clause.type}</CardTitle>
                          {getRiskBadge(clause.riskScore)}
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm whitespace-pre-wrap">{clause.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <ClauseHighlighter 
            contractText={contractText} 
            clauses={clauses}
            onClauseClick={handleClauseClick}
          />
        )}

        {selectedClause && viewMode === 'highlight' && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{selectedClause.type}</h3>
              {getRiskBadge(selectedClause.riskScore)}
            </div>
            <p className="text-sm whitespace-pre-wrap">{selectedClause.text}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {clauses.length > 0 && (
          <Button variant="outline" onClick={extractClauses} disabled={isExtracting}>
            {isExtracting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh Clauses
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}