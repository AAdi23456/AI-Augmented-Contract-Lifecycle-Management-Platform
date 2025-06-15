'use client';

import ContractUploadForm from '@/components/contracts/ContractUploadForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function ContractUploadPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Upload Contract</h1>
      <ContractUploadForm />
    </div>
  );
}

export default function ProtectedContractUploadPage() {
  return (
    <ProtectedRoute>
      <ContractUploadPage />
    </ProtectedRoute>
  );
} 