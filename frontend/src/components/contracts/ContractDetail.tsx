import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClauseExtraction } from './ClauseExtraction';
import { RiskDetection } from './RiskDetection';
import { api } from '@/lib/api';
import { ContractMetadata } from "./ContractMetadata";
import { ContractClauses } from "./ContractClauses";
import { ContractTimeline } from "./ContractTimeline";
import { ContractSummary } from "./ContractSummary";
import { QaAssistant } from "./QaAssistant";
import { ClauseSuggestions } from "./ClauseSuggestions";

interface ContractDetailProps {
  contractId: string;
}

export function ContractDetail({ contractId }: ContractDetailProps) {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contractText, setContractText] = useState('');

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/contracts/${contractId}`);
        setContract(response.data);
        
        // Fetch contract text if available
        if (response.data.latestVersion?.plainText) {
          setContractText(response.data.latestVersion.plainText);
        } else {
          // If plain text is not available, we might need to extract it
          // This would typically be handled by the backend
          console.log('Contract text not available');
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  if (loading) {
    return <div>Loading contract details...</div>;
  }

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{contract.title}</h1>
        <Button variant="outline">Download</Button>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="clauses">Clauses</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="qa">Q&A Assistant</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <ContractSummary contractId={contract.id} />
        </TabsContent>
        
        <TabsContent value="metadata">
          <ContractMetadata contract={contract} />
        </TabsContent>
        
        <TabsContent value="clauses">
          <ContractClauses contractId={contract.id} />
        </TabsContent>
        
        <TabsContent value="suggestions">
          <ClauseSuggestions contractId={contract.id} contractText={contractText} />
        </TabsContent>
        
        <TabsContent value="risk">
          <RiskDetection contractId={contract.id} />
        </TabsContent>
        
        <TabsContent value="qa">
          <QaAssistant contractId={contract.id} />
        </TabsContent>
        
        <TabsContent value="timeline">
          <ContractTimeline contractId={contract.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 