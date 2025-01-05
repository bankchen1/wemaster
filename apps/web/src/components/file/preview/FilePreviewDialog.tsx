import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImagePreview } from './ImagePreview';
import { PDFPreview } from './PDFPreview';
import { VideoPreview } from './VideoPreview';
import { AudioPreview } from './AudioPreview';

interface FilePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    mimeType: string;
    url: string;
  };
}

export const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const renderPreview = () => {
    if (file.mimeType.startsWith('image/')) {
      return <ImagePreview url={file.url} alt={file.name} />;
    }
    if (file.mimeType === 'application/pdf') {
      return <PDFPreview url={file.url} />;
    }
    if (file.mimeType.startsWith('video/')) {
      return <VideoPreview url={file.url} />;
    }
    if (file.mimeType.startsWith('audio/')) {
      return (
        <AudioPreview
          url={file.url}
          title={file.name}
          artist="Unknown Artist"
        />
      );
    }
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="truncate">{file.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  );
};
