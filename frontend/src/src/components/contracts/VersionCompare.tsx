'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ContractVersion {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  versionNumber: number;
  createdAt: string;
}

interface VersionCompareProps {
  versions: ContractVersion[];
}

export default function VersionCompare({ versions }: VersionCompareProps) {
  // Sort versions by version number (descending)
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Version History</h2>
      
      <div className="grid gap-4">
        {sortedVersions.map((version) => (
          <Card key={version.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">
                  Version {version.versionNumber}
                  {version.versionNumber === 1 && ' (Original)'}
                </CardTitle>
                <Badge variant="outline">
                  {formatDate(version.createdAt)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">{version.fileName}</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(version.fileUrl, version.fileName)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(version.fileUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 