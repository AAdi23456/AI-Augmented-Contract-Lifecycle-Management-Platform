import { ContractDetail } from '@/components/contracts/ContractDetail';

interface ContractDetailPageProps {
  params: {
    id: string;
  };
}

export default function ContractDetailPage({ params }: ContractDetailPageProps) {
  return (
    <div className="container py-6">
      <ContractDetail contractId={params.id} />
    </div>
  );
} 