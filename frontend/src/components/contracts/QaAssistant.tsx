import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, User, Bot } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface QaAssistantProps {
  contractId: string;
}

interface QaHistory {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

interface QaResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

export function QaAssistant({ contractId }: QaAssistantProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<QaHistory[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch previous Q&A history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/api/qa-assistant/history/${contractId}`);
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching Q&A history:', error);
      }
    };

    if (contractId) {
      fetchHistory();
    }
  }, [contractId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post<QaResponse>('/api/qa-assistant/answer', {
        contractId,
        question: question.trim(),
      });
      
      // Add to local history immediately for UI responsiveness
      const newQa = {
        id: Date.now().toString(), // Temporary ID
        question: question.trim(),
        answer: response.data.answer,
        createdAt: new Date().toISOString(),
      };
      
      setHistory([...history, newQa]);
      setQuestion('');
      
      // Show confidence level as toast if low
      if (response.data.confidence < 0.7) {
        toast({
          title: 'Low confidence answer',
          description: 'The AI is not very confident in this answer. Please verify with the actual contract.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: 'Error',
        description: 'Failed to get an answer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-500">High Confidence</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-500">Medium Confidence</Badge>;
    } else {
      return <Badge className="bg-red-500">Low Confidence</Badge>;
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Contract Q&A Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bot size={48} />
              <p className="mt-2">Ask questions about this contract</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><User size={16} /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                      <p>{item.question}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 flex-row-reverse">
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback><Bot size={16} /></AvatarFallback>
                    </Avatar>
                    <div className="bg-primary/10 p-3 rounded-lg max-w-[80%]">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input
            placeholder="Ask a question about this contract..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !question.trim()}>
            {isLoading ? 'Thinking...' : <Send size={16} />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 