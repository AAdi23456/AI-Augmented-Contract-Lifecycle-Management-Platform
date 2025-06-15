'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Tag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagsManager } from './TagsManager';

interface ContractFormProps {
  initialData?: {
    title: string;
    counterparty?: string;
    effectiveDate?: string;
    expiryDate?: string;
    status?: 'Draft' | 'Review' | 'Signed' | 'Expired';
    tags?: string[];
  };
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ContractForm({ initialData, onSubmit, isLoading = false }: ContractFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    counterparty: '',
    effectiveDate: '',
    expiryDate: '',
    status: 'Draft',
    tags: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common tags for suggestions
  const commonTags = [
    'Legal', 'HR', 'Finance', 'IT', 'Sales', 'Marketing', 
    'NDA', 'Service', 'License', 'Employment', 'Consulting'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        counterparty: initialData.counterparty || '',
        effectiveDate: initialData.effectiveDate || '',
        expiryDate: initialData.expiryDate || '',
        status: initialData.status || 'Draft',
        tags: initialData.tags || []
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.effectiveDate && formData.expiryDate) {
      const effectiveDate = new Date(formData.effectiveDate);
      const expiryDate = new Date(formData.expiryDate);
      
      if (expiryDate < effectiveDate) {
        newErrors.expiryDate = 'Expiry date must be after effective date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Contract Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter contract title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="counterparty" className="block text-sm font-medium text-gray-700 mb-1">
            Counterparty
          </label>
          <div className="relative">
            <input
              type="text"
              id="counterparty"
              name="counterparty"
              value={formData.counterparty}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter counterparty name"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="effectiveDate"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2 border rounded-md ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Draft">Draft</option>
            <option value="Review">Review</option>
            <option value="Signed">Signed</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <TagsManager 
            tags={formData.tags} 
            onTagsChange={handleTagsChange} 
            availableTags={commonTags} 
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Contract'}
        </Button>
      </div>
    </form>
  );
} 