import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  url: string;
  alt?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ url, alt }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm">{Math.round(scale * 100)}%</span>
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleRotate}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      <div
        className="relative overflow-auto"
        style={{
          maxHeight: 'calc(100vh - 200px)',
          maxWidth: '100%',
        }}
      >
        <img
          src={url}
          alt={alt || 'Preview'}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-in-out',
          }}
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
};
