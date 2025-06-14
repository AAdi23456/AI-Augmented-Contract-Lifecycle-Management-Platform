import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

interface RiskDetectionProps {
  contractId: string;
  contractText: string;
  onAnalyzed?: (result: any) => void;
}

interface RiskTerm {
  term: string;
  context: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

interface RiskAnalysisResult {
  contractId: string;
  overallRiskScore: number;
  riskTerms: RiskTerm[];
}

export function RiskDetection({ contractId, contractText, onAnalyzed }: RiskDetectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysisResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if risk analysis already exists for this contract
    const fetchExistingAnalysis = async () => {
      try {
        const response = await api.get(`/risk-detection/contract/${contractId}`);
        if (response.data && response.data.overallRiskScore) {
          setRiskAnalysis(response.data);
        }
      } catch (error) {
        console.error('Error fetching existing risk analysis:', error);
      }
    };

    if (contractId) {
      fetchExistingAnalysis();
    }
  }, [contractId]);

  const analyzeRisk = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post('/risk-detection/analyze', {
        contractId,
        contractText,
      });
      
      setRiskAnalysis(response.data);
      if (onAnalyzed) {
        onAnalyzed(response.data);
      }
      
      toast({
        title: "Risk analysis complete",
        description: `Overall risk score: ${response.data.overallRiskScore}%`,
      });
    } catch (error) {
      console.error('Error analyzing risk:', error);
      toast({
        title: "Failed to analyze risk",
        description: "An error occurred during risk analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'MEDIUM':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'LOW':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contract Risk Analysis</CardTitle>
        <CardDescription>
          Analyze the contract for risky terms and clauses using AI and rule-based detection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!riskAnalysis ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 text-muted-foreground">
              {isAnalyzing ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : (
                <div className="rounded-full bg-muted p-3">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold">
              {isAnalyzing ? 'Analyzing contract risk...' : 'No risk analysis yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {isAnalyzing 
                ? 'Our AI is analyzing the contract to identify potential risks and calculate an overall risk score.' 
                : 'Click the button below to analyze this contract for potential risks.'}
            </p>
            {!isAnalyzing && (
              <Button onClick={analyzeRisk} disabled={isAnalyzing}>
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Risk
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Overall Risk Score</h3>
                <span className="text-2xl font-bold">{riskAnalysis.overallRiskScore}%</span>
              </div>
              <Progress 
                value={riskAnalysis.overallRiskScore} 
                className={`h-2 ${getRiskScoreColor(riskAnalysis.overallRiskScore)}`} 
              />
              <p className="text-sm text-muted-foreground">
                {riskAnalysis.overallRiskScore >= 70 
                  ? 'High risk contract with significant concerning terms.' 
                  : riskAnalysis.overallRiskScore >= 40 
                    ? 'Medium risk contract with some concerning terms.' 
                    : 'Low risk contract with few concerning terms.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Detected Risk Terms</h3>
              {riskAnalysis.riskTerms.length > 0 ? (
                <div className="space-y-4">
                  {riskAnalysis.riskTerms.map((term, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getRiskIcon(term.riskLevel)}
                            <h4 className="font-medium">{term.term}</h4>
                          </div>
                          {getRiskBadge(term.riskLevel)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{term.description}</p>
                        <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                          <span className="font-mono">"{term.context}"</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No risk terms detected in this contract.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {riskAnalysis && (
          <Button variant="outline" onClick={analyzeRisk} disabled={isAnalyzing}>
            {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh Analysis
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 