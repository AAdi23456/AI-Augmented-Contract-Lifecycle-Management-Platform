import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ContractSummary } from '../ContractSummary';
import { FileText, ListChecks, MessageSquare, AlertTriangle } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  status: string;
  fileUrl: string;
  createdAt: string;
  expiryDate?: string;
  counterpartyName?: string;
  summaries?: any[];
  clauses?: any[];
  riskTerms?: any[];
}

interface ContractDetailTabsProps {
  contract: Contract;
}

export function ContractDetailTabs({ contract }: ContractDetailTabsProps) {
  // Get the latest summary if available
  const latestSummary = contract.summaries?.length 
    ? contract.summaries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : undefined;

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="summary" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Summary</span>
        </TabsTrigger>
        <TabsTrigger value="clauses" className="flex items-center gap-2">
          <ListChecks className="h-4 w-4" />
          <span>Clauses</span>
        </TabsTrigger>
        <TabsTrigger value="risks" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Risks</span>
        </TabsTrigger>
        <TabsTrigger value="comments" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Comments</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="summary" className="space-y-6">
        <ContractSummary 
          contractId={contract.id} 
          initialSummary={latestSummary}
        />
        
        {/* Document Preview */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Document Preview</h3>
          <div className="border rounded-lg overflow-hidden h-[500px]">
            <iframe 
              src={contract.fileUrl} 
              className="w-full h-full"
              title={`${contract.title} preview`}
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="clauses">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contract Clauses</h3>
          {contract.clauses?.length ? (
            <div className="space-y-4">
              {contract.clauses.map((clause) => (
                <div key={clause.id} className="border rounded-lg p-4">
                  <h4 className="font-medium">{clause.type}</h4>
                  <p className="mt-2 text-gray-700">{clause.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No clauses extracted yet</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="risks">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Risk Analysis</h3>
          {contract.riskTerms?.length ? (
            <div className="space-y-4">
              {contract.riskTerms.map((risk) => (
                <div key={risk.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{risk.term}</h4>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        risk.riskLevel === 'HIGH' 
                          ? 'bg-red-100 text-red-800' 
                          : risk.riskLevel === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {risk.riskLevel}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{risk.context}</p>
                  <p className="mt-1 text-sm text-gray-500">{risk.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No risks detected yet</p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="comments">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Comments</h3>
          <p className="text-gray-500">Comments feature coming soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
} 